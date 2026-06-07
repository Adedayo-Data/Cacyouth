const express = require('express');
const router = express.Router();
const pool = require('../db');

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
    try {
      await pool.query(
        `UPDATE registrations
         SET payment_status = $1, payment_ref = $2
         WHERE tx_ref = $3`,
        [status, String(data.id), data.tx_ref]
      );
    } catch (err) {
      console.error('FLW webhook DB error:', err);
    }
  }

  res.status(200).send('OK');
});

// ── GET /api/payment/status/:txRef ────────────────────────────────────────
// Optional: check payment status for a given tx_ref (admin use / debugging).
router.get('/status/:txRef', async (req, res) => {
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
