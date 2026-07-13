const express = require('express');
const router = express.Router();
const pool = require('../db');
const { sendSlipEmail, sendVendorSlipEmail } = require('../utils/email');

// ── POST /api/payment/webhook ──────────────────────────────────────────────
// Flutterwave sends this server-to-server after a payment completes.
// In your Flutterwave dashboard → Settings → Webhooks:
//   URL: https://mryc.online/api/payment/webhook
//   Secret hash: same value as FLW_SECRET_HASH in Railway env vars
router.post('/webhook', async (req, res) => {
  const secretHash = process.env.FLW_SECRET_HASH;

  // Verify the request is genuinely from Flutterwave
  const signature = req.headers['verif-hash'];
  if (!secretHash || signature !== secretHash) {
    console.warn('Flutterwave webhook: invalid or missing verif-hash');
    return res.status(401).send('Unauthorized');
  }

  const { event, data } = req.body;
  console.log('FLW webhook event:', event, 'tx_ref:', data?.tx_ref, 'status:', data?.status);

  if (event === 'charge.completed' && data?.tx_ref) {
    const status = data.status === 'successful' ? 'success' : data.status;
    const isVendor = String(data.tx_ref).startsWith('CACVENDOR-');

    try {
      if (isVendor) {
        const updated = await pool.query(
          `UPDATE vendors SET payment_status = $1, payment_ref = $2 WHERE tx_ref = $3
           RETURNING name, business_name, category, phone, email, unique_code, amount`,
          [status, String(data.id), data.tx_ref]
        );

        if (status === 'success' && updated.rows.length > 0) {
          const v = updated.rows[0];
          const vendor = {
            name: v.name, businessName: v.business_name, category: v.category,
            phone: v.phone, email: v.email, uniqueCode: v.unique_code, amount: v.amount,
          };
          if (vendor.email) {
            sendVendorSlipEmail(vendor).catch(err => console.error('Webhook vendor email failed:', err.message));
          }
        }
      } else {
        const updated = await pool.query(
          `UPDATE registrations
           SET payment_status = $1, payment_ref = $2
           WHERE tx_ref = $3
           RETURNING name, state, dcc_zone, phone, email, unique_code`,
          [status, String(data.id), data.tx_ref]
        );

        if (status === 'success' && updated.rows.length > 0) {
          const r = updated.rows[0];
          const reg = {
            name: r.name, state: r.state, dccZone: r.dcc_zone,
            phone: r.phone, email: r.email, uniqueCode: r.unique_code,
          };
          if (reg.email) {
            sendSlipEmail(reg).catch(err => console.error('Webhook email failed:', err.message));
          }
        }
      }
    } catch (err) {
      console.error('FLW webhook DB error:', err);
    }
  }

  res.status(200).send('OK');
});

// ── POST /api/payment/sync ── admin only ───────────────────────────────────
// Calls Flutterwave verify-by-reference for every pending registration that has
// a tx_ref, then updates the DB. Fixes records stuck as 'pending' because the
// webhook was rejected (e.g. FLW_SECRET_HASH not set in env → always 401).
router.post('/sync', async (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const flwSecret = process.env.FLW_SECRET_KEY;
  if (!flwSecret) {
    return res.status(500).json({ error: 'FLW_SECRET_KEY is not set in Railway environment variables' });
  }

  const verify = async (txRef) => {
    const flwRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
      { headers: { Authorization: `Bearer ${flwSecret}` } }
    );
    return flwRes.json();
  };

  let synced = 0;
  let failed = 0;
  const details = [];

  try {
    const pendingRegs = await pool.query(
      `SELECT id, tx_ref, name FROM registrations
       WHERE payment_status != 'success' AND tx_ref IS NOT NULL`
    );

    for (const row of pendingRegs.rows) {
      try {
        const flwData = await verify(row.tx_ref);

        if (flwData.status === 'success' && flwData.data?.status === 'successful') {
          const updated = await pool.query(
            `UPDATE registrations SET payment_status = 'success', payment_ref = $1 WHERE id = $2
             RETURNING name, state, dcc_zone, phone, email, unique_code`,
            [String(flwData.data.id), row.id]
          );
          synced++;
          details.push({ name: row.name, tx_ref: row.tx_ref, result: 'synced' });

          const r = updated.rows[0];
          if (r?.email) {
            sendSlipEmail({
              name: r.name, state: r.state, dccZone: r.dcc_zone,
              phone: r.phone, email: r.email, uniqueCode: r.unique_code,
            }).catch(err => console.error('Sync email failed:', err.message));
          }
        } else {
          details.push({ name: row.name, tx_ref: row.tx_ref, result: flwData.data?.status ?? 'not_found' });
        }
      } catch (err) {
        failed++;
        details.push({ name: row.name, tx_ref: row.tx_ref, result: 'error', error: err.message });
      }
    }

    const pendingVendors = await pool.query(
      `SELECT id, tx_ref, name FROM vendors
       WHERE payment_status != 'success' AND tx_ref IS NOT NULL`
    );

    for (const row of pendingVendors.rows) {
      try {
        const flwData = await verify(row.tx_ref);

        if (flwData.status === 'success' && flwData.data?.status === 'successful') {
          const updated = await pool.query(
            `UPDATE vendors SET payment_status = 'success', payment_ref = $1 WHERE id = $2
             RETURNING name, business_name, category, phone, email, unique_code, amount`,
            [String(flwData.data.id), row.id]
          );
          synced++;
          details.push({ name: row.name, tx_ref: row.tx_ref, result: 'synced' });

          const v = updated.rows[0];
          if (v?.email) {
            sendVendorSlipEmail({
              name: v.name, businessName: v.business_name, category: v.category,
              phone: v.phone, email: v.email, uniqueCode: v.unique_code, amount: v.amount,
            }).catch(err => console.error('Sync vendor email failed:', err.message));
          }
        } else {
          details.push({ name: row.name, tx_ref: row.tx_ref, result: flwData.data?.status ?? 'not_found' });
        }
      } catch (err) {
        failed++;
        details.push({ name: row.name, tx_ref: row.tx_ref, result: 'error', error: err.message });
      }
    }

    const checked = pendingRegs.rows.length + pendingVendors.rows.length;
    if (checked === 0) {
      return res.json({ synced: 0, failed: 0, checked: 0, message: 'No pending registrations or vendors to sync' });
    }

    res.json({ synced, failed, checked, details });
  } catch (err) {
    console.error('Payment sync error:', err);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// ── GET /api/payment/status/:txRef ── admin only ──────────────────────────
router.get('/status/:txRef', (req, res, next) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT unique_code, payment_status, tx_ref FROM registrations WHERE tx_ref = $1`,
      [req.params.txRef]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
