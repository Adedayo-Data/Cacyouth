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

        if (updated.rows.length === 0) {
          console.warn('FLW webhook: no vendor row matched tx_ref', data.tx_ref, '— transaction id', data.id);
        }

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

        if (updated.rows.length === 0) {
          console.warn('FLW webhook: no registration row matched tx_ref', data.tx_ref, '— transaction id', data.id);
        }

        // A bulk group registration shares one tx_ref across many rows, so this
        // UPDATE can return more than one row — loop so every person in the group
        // gets their own slip email, not just the first.
        if (status === 'success') {
          for (const r of updated.rows) {
            if (!r.email) continue;
            sendSlipEmail({
              name: r.name, state: r.state, dccZone: r.dcc_zone,
              phone: r.phone, email: r.email, uniqueCode: r.unique_code,
            }).catch(err => console.error('Webhook email failed:', err.message));
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

  // Checking rows one at a time used to take long enough (with hundreds of
  // pending rows) to hit Railway's request timeout and return an HTML error
  // page instead of JSON. Run CONCURRENCY at a time instead.
  const CONCURRENCY = 25;
  const processInBatches = async (rows, handler) => {
    for (let i = 0; i < rows.length; i += CONCURRENCY) {
      await Promise.all(rows.slice(i, i + CONCURRENCY).map(handler));
    }
  };

  let synced = 0;
  let failed = 0;
  const details = [];

  const syncRegistration = async (row) => {
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
  };

  const syncVendor = async (row) => {
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
  };

  try {
    const pendingRegs = await pool.query(
      `SELECT id, tx_ref, name FROM registrations
       WHERE payment_status != 'success' AND tx_ref IS NOT NULL`
    );
    await processInBatches(pendingRegs.rows, syncRegistration);

    const pendingVendors = await pool.query(
      `SELECT id, tx_ref, name FROM vendors
       WHERE payment_status != 'success' AND tx_ref IS NOT NULL`
    );
    await processInBatches(pendingVendors.rows, syncVendor);

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

// ── POST /api/payment/audit ── admin only ──────────────────────────────────
// Unlike /sync (which only rechecks tx_refs we already have a DB row for),
// this pulls Flutterwave's own list of successful transactions for a date
// window and cross-checks each one against our DB. It catches the case that
// bit us with Otitoju Seun: a real successful payment whose tx_ref was
// overwritten/lost from our side entirely, so there was no local row left to
// even attempt to sync. Rows found with a matching tx_ref that aren't yet
// 'success' get auto-fixed exactly like /sync does.
//
// When no row matches by tx_ref, we fall back to matching by the customer's
// phone/email (the same values our form sent to Flutterwave at checkout)
// against any non-success row in the same table — that's exactly what
// Otitoju's case turned out to be: not missing data, just filed under the
// wrong tx_ref. If exactly one candidate matches, we repair it the same way
// we did his manually. If zero or multiple rows match, we can't safely guess,
// so it's reported as 'orphaned' for manual review — this is the genuinely
// rare case where the initial pre-save itself never made it to the DB, and
// we have no record of required fields (state, dcc_zone, etc.) to recreate it.
router.post('/audit', async (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const flwSecret = process.env.FLW_SECRET_KEY;
  if (!flwSecret) {
    return res.status(500).json({ error: 'FLW_SECRET_KEY is not set in Railway environment variables' });
  }

  const days = Math.min(parseInt(req.body?.days, 10) || 14, 90);
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = new Date().toISOString().slice(0, 10);

  try {
    const transactions = [];
    let page = 1;
    while (page <= 20) {
      const flwRes = await fetch(
        `https://api.flutterwave.com/v3/transactions?from=${from}&to=${to}&status=successful&page=${page}`,
        { headers: { Authorization: `Bearer ${flwSecret}` } }
      );
      const body = await flwRes.json();
      if (body.status !== 'success' || !Array.isArray(body.data) || body.data.length === 0) break;
      transactions.push(...body.data);
      const totalPages = body.meta?.page_info?.total_pages;
      if (!totalPages || page >= totalPages) break;
      page++;
    }

    const fixed = [];
    const orphaned = [];

    for (const txn of transactions) {
      const txRef = txn.tx_ref;
      if (!txRef) continue;
      const isVendor = String(txRef).startsWith('CACVENDOR-');

      const existing = isVendor
        ? await pool.query('SELECT id, payment_status FROM vendors WHERE tx_ref = $1', [txRef])
        : await pool.query('SELECT id, payment_status FROM registrations WHERE tx_ref = $1', [txRef]);

      // A bulk group registration shares one tx_ref across many rows — fix every
      // non-success row that matched, not just the first (that used to silently
      // skip everyone in a group after the first person).
      let dbRows = existing.rows.filter(r => r.payment_status !== 'success');
      let matchedBy = 'tx_ref';

      if (existing.rows.length === 0) {
        const email = txn.customer?.email;
        const phone = txn.customer?.phone_number;

        if (email || phone) {
          const candidates = isVendor
            ? await pool.query(
                `SELECT id, payment_status FROM vendors
                 WHERE payment_status != 'success' AND (phone = $1 OR LOWER(email) = LOWER($2))`,
                [phone || null, email || null]
              )
            : await pool.query(
                `SELECT id, payment_status FROM registrations
                 WHERE payment_status != 'success' AND (phone = $1 OR LOWER(email) = LOWER($2))`,
                [phone || null, email || null]
              );

          if (candidates.rows.length === 1) {
            dbRows = candidates.rows;
            matchedBy = 'phone/email';
            const setTxRef = isVendor
              ? await pool.query('UPDATE vendors SET tx_ref = $1 WHERE id = $2', [txRef, dbRows[0].id])
              : await pool.query('UPDATE registrations SET tx_ref = $1 WHERE id = $2', [txRef, dbRows[0].id]);
            void setTxRef;
          } else {
            orphaned.push({
              tx_ref: txRef,
              flw_transaction_id: txn.id,
              amount: txn.amount,
              email, name: txn.customer?.name, phone,
              paid_at: txn.created_at,
              table: isVendor ? 'vendors' : 'registrations',
              candidateRowsFound: candidates.rows.length,
            });
            continue;
          }
        } else {
          orphaned.push({
            tx_ref: txRef,
            flw_transaction_id: txn.id,
            amount: txn.amount,
            email, name: txn.customer?.name, phone,
            paid_at: txn.created_at,
            table: isVendor ? 'vendors' : 'registrations',
            candidateRowsFound: 0,
          });
          continue;
        }
      }

      for (const dbRow of dbRows) {
        if (isVendor) {
          const updated = await pool.query(
            `UPDATE vendors SET payment_status = 'success', payment_ref = $1 WHERE id = $2
             RETURNING name, business_name, category, phone, email, unique_code, amount`,
            [String(txn.id), dbRow.id]
          );
          fixed.push({ tx_ref: txRef, table: 'vendors', name: updated.rows[0]?.name, matchedBy });
          const v = updated.rows[0];
          if (v?.email) {
            sendVendorSlipEmail({
              name: v.name, businessName: v.business_name, category: v.category,
              phone: v.phone, email: v.email, uniqueCode: v.unique_code, amount: v.amount,
            }).catch(err => console.error('Audit vendor email failed:', err.message));
          }
        } else {
          const updated = await pool.query(
            `UPDATE registrations SET payment_status = 'success', payment_ref = $1 WHERE id = $2
             RETURNING name, state, dcc_zone, phone, email, unique_code`,
            [String(txn.id), dbRow.id]
          );
          fixed.push({ tx_ref: txRef, table: 'registrations', name: updated.rows[0]?.name, matchedBy });
          const r = updated.rows[0];
          if (r?.email) {
            sendSlipEmail({
              name: r.name, state: r.state, dccZone: r.dcc_zone,
              phone: r.phone, email: r.email, uniqueCode: r.unique_code,
            }).catch(err => console.error('Audit email failed:', err.message));
          }
        }
      }
    }

    res.json({
      windowDays: days,
      checked: transactions.length,
      fixed: fixed.length,
      fixedDetails: fixed,
      orphaned: orphaned.length,
      orphanedDetails: orphaned,
    });
  } catch (err) {
    console.error('Payment audit error:', err);
    res.status(500).json({ error: 'Audit failed' });
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
