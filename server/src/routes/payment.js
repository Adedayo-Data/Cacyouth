const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { sha3_512 } = require('js-sha3');
const pool = require('../db');

// Use OPAY_LIVE=true to switch to live API. Everything else = sandbox.
const OPAY_BASE_URL = process.env.OPAY_LIVE === 'true'
  ? 'https://liveapi.opaycheckout.com'
  : 'https://testapi.opaycheckout.com';

const CONFERENCE_FEE_KOBO = 300000; // ₦3,000
const CONFERENCE_FEE_NGN  = 3000;

// Recursive key-sort for HMAC-SHA512 server-to-server OPay requests
function sortDeep(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortDeep);
  return Object.keys(obj).sort().reduce((acc, k) => {
    acc[k] = sortDeep(obj[k]);
    return acc;
  }, {});
}

function opayHmac512(payload) {
  const body = JSON.stringify(sortDeep(payload));
  return crypto.createHmac('sha512', process.env.OPAY_PRIVATE_KEY).update(body).digest('hex');
}

// Verify OPay webhook signature (HMAC-SHA3-512)
function verifyWebhook(payload, received) {
  const { amount, currency, reference, refunded, status, timestamp, token, transactionId } = payload;
  const str = `{Amount:"${amount}",Currency:"${currency}",Reference:"${reference}",Refunded:${refunded ? 't' : 'f'},Status:"${status}",Timestamp:"${timestamp}",Token:"${token}",TransactionID:"${transactionId}"}`;
  const hmac = sha3_512.hmac.create(process.env.OPAY_PRIVATE_KEY);
  hmac.update(str);
  return hmac.hex() === received;
}

// ── POST /api/payment/initiate ─────────────────────────────────────────────
// Saves a pending registration, creates OPay cashier session, returns cashierUrl.
router.post('/initiate', async (req, res) => {
  const {
    firstName, middleName, lastName, name,
    dob, dccZone, gender, phone, email,
    state, status, occupation, qualification, uniqueCode,
  } = req.body;

  const reference = `CACYOUTH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  try {
    // Persist registration as pending — webhook will confirm it
    await pool.query(
      `INSERT INTO registrations
        (first_name, middle_name, last_name, name, dob, dcc_zone, gender,
         phone, email, state, status, occupation, qualification,
         unique_code, tx_ref, amount, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pending')`,
      [
        firstName, middleName || null, lastName, name, dob, dccZone, gender,
        phone, email, state, status, occupation, qualification,
        uniqueCode, reference, CONFERENCE_FEE_NGN,
      ]
    );

    const APP_URL = process.env.APP_URL || 'http://localhost:3001';

    // Call OPay cashier/create
    const opayPayload = {
      country: 'NG',
      reference,
      amount: { total: CONFERENCE_FEE_KOBO, currency: 'NGN' },
      returnUrl: `${APP_URL}/payment/return`,
      callbackUrl: `${APP_URL}/api/payment/webhook`,
      cancelUrl: `${APP_URL}/conference`,
      displayName: 'CAC Youth Fellowship',
      product: {
        name: '2026 Youth Conference Registration',
        description: 'Conference registration fee — CAC Youth Fellowship Medaiyese Region',
      },
      userInfo: { userName: name, userMobile: phone, userEmail: email },
      expireAt: 60,
    };

    const opayRes = await fetch(`${OPAY_BASE_URL}/api/v1/international/cashier/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPAY_PUBLIC_KEY}`,
        'MerchantId': process.env.OPAY_MERCHANT_ID,
      },
      body: JSON.stringify(opayPayload),
    });

    const opayData = await opayRes.json();
    console.log('OPay response:', JSON.stringify(opayData));
    if (opayData.code !== '00000') {
      throw new Error(`OPay error [${opayData.code}]: ${opayData.message}`);
    }

    res.json({
      cashierUrl: opayData.data.cashierUrl,
      reference,
      uniqueCode,
    });
  } catch (err) {
    console.error('Payment initiate error:', err);
    // Roll back the pending registration so the user can retry cleanly
    try { await pool.query('DELETE FROM registrations WHERE tx_ref = $1', [reference]); } catch {}
    res.status(500).json({ error: 'Failed to initiate payment. Please try again.' });
  }
});

// ── POST /api/payment/webhook ──────────────────────────────────────────────
// OPay sends this server-to-server after payment completes.
router.post('/webhook', async (req, res) => {
  const { payload, sha512: sig } = req.body;
  if (!payload || !sig) return res.status(400).send('Bad request');

  if (!verifyWebhook(payload, sig)) {
    console.warn('OPay webhook: invalid signature');
    return res.status(401).send('Invalid signature');
  }

  try {
    if (payload.status === 'SUCCESS') {
      await pool.query(
        `UPDATE registrations
         SET payment_status = 'success', payment_ref = $1
         WHERE tx_ref = $2`,
        [payload.transactionId, payload.reference]
      );
    } else {
      await pool.query(
        `UPDATE registrations SET payment_status = $1 WHERE tx_ref = $2`,
        [payload.status.toLowerCase(), payload.reference]
      );
    }
  } catch (err) {
    console.error('Webhook DB error:', err);
  }

  res.status(200).send('OK');
});

// ── GET /api/payment/status/:reference ────────────────────────────────────
// Frontend polls this on the return page to get registration data for the slip.
router.get('/status/:reference', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, first_name, middle_name, last_name, dob, dcc_zone,
              gender, phone, email, state, status, occupation, qualification,
              unique_code, payment_status, tx_ref, registered_at
       FROM registrations WHERE tx_ref = $1`,
      [req.params.reference]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const r = result.rows[0];
    res.json({
      id: String(r.id),
      name: r.name,
      firstName: r.first_name,
      middleName: r.middle_name,
      lastName: r.last_name,
      dob: r.dob,
      dccZone: r.dcc_zone,
      gender: r.gender,
      phone: r.phone,
      email: r.email,
      state: r.state,
      status: r.status,
      occupation: r.occupation,
      qualification: r.qualification,
      uniqueCode: r.unique_code,
      paymentStatus: r.payment_status,
      txRef: r.tx_ref,
      registeredAt: r.registered_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
});

// ── POST /api/payment/query ────────────────────────────────────────────────
// Optional: verify payment status directly with OPay (admin use).
router.post('/query', async (req, res) => {
  const { reference } = req.body;
  const payload = { reference, country: 'NG' };
  try {
    const opayRes = await fetch(`${OPAY_BASE_URL}/api/v1/international/cashier/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${opayHmac512(payload)}`,
        'MerchantId': process.env.OPAY_MERCHANT_ID,
      },
      body: JSON.stringify(payload),
    });
    const data = await opayRes.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
