const express = require('express');
const router = express.Router();
const pool = require('../db');
const { sendSlipEmail } = require('../utils/email');
const { resendAllSlips } = require('../utils/resend');

const toReg = (row) => ({
  id: String(row.id),
  firstName: row.first_name,
  middleName: row.middle_name,
  lastName: row.last_name,
  name: row.name,
  dob: row.dob,
  dccZone: row.dcc_zone,
  assemblyName: row.assembly_name,
  denomination: row.denomination,
  gender: row.gender,
  phone: row.phone,
  email: row.email,
  state: row.state,
  status: row.status,
  occupation: row.occupation,
  qualification: row.qualification,
  uniqueCode: row.unique_code,
  paymentRef: row.payment_ref,
  paymentStatus: row.payment_status,
  txRef: row.tx_ref,
  amount: row.amount,
  verified: row.verified,
  verifiedAt: row.verified_at,
  registeredAt: row.registered_at,
});

const requireAdmin = (req, res, next) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// POST /api/registrations — create a pending registration before payment begins.
// payment_status is always forced to 'pending' here — only the Flutterwave
// webhook (verified by secret hash) is allowed to promote it to 'success'.
router.post('/', async (req, res) => {
  const {
    firstName, middleName, lastName, name, dob, dccZone, assemblyName, denomination, gender,
    phone, email, state, status, occupation, qualification,
    uniqueCode, txRef, amount,
  } = req.body;

  try {
    // Idempotency: if a record with this tx_ref already exists, return it instead of
    // inserting a duplicate. This prevents the client's fallback path from creating
    // a second row when the pre-save succeeded but the network response was lost.
    if (txRef) {
      const existing = await pool.query(
        'SELECT * FROM registrations WHERE tx_ref = $1',
        [txRef]
      );
      if (existing.rows.length > 0) {
        return res.status(200).json(toReg(existing.rows[0]));
      }
    }

    // De-dupe abandoned attempts: if this same person (same phone + name) already
    // has an unpaid pending registration from an earlier attempt (e.g. they tried
    // to pay, it failed, and filled the form again instead of using "already
    // registered"), mark that old row 'abandoned' and fall through to insert a
    // fresh row for the new attempt — instead of overwriting its tx_ref in place.
    // Overwriting used to orphan the old tx_ref: if that earlier attempt actually
    // succeeded on Flutterwave after the user retried (e.g. a delayed bank
    // transfer confirmation), the webhook/sync for that tx_ref would find no
    // matching row and silently do nothing. Marking it 'abandoned' keeps the row
    // (and its tx_ref) reconcilable forever — sync already checks any row with
    // payment_status != 'success'. Matched on phone+name (not email) because one
    // email may legitimately cover several different registrants.
    if (phone && name) {
      await pool.query(
        `UPDATE registrations SET payment_status = 'abandoned'
         WHERE phone = $1 AND LOWER(name) = LOWER($2) AND payment_status = 'pending'`,
        [phone, name]
      );
    }

    const result = await pool.query(
      `INSERT INTO registrations
        (first_name, middle_name, last_name, name, dob, dcc_zone, assembly_name, denomination, gender,
         phone, email, state, status, occupation, qualification,
         unique_code, tx_ref, amount, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [
        firstName, middleName || null, lastName, name, dob, dccZone, assemblyName || null,
        denomination || null, gender, phone, email, state, status, occupation, qualification,
        uniqueCode, txRef || null, amount || 3100, 'pending',
      ]
    );
    res.status(201).json(toReg(result.rows[0]));
  } catch (err) {
    console.error('Create registration error:', err);
    res.status(500).json({ error: 'Failed to save registration' });
  }
});

// POST /api/registrations/bulk — pre-save a whole group before one shared payment.
// A group leader pays once for N people; every row gets the SAME tx_ref so the
// Flutterwave webhook's single UPDATE...WHERE tx_ref=$1 naturally flips all N rows
// to 'success' at once (see payment.js, which now loops over every returned row
// to send each person their own slip email). Wrapped in a transaction so a bad
// row can't leave a half-created group sitting in the DB.
router.post('/bulk', async (req, res) => {
  const { registrants, txRef } = req.body;

  if (!txRef) return res.status(400).json({ error: 'txRef is required' });
  if (!Array.isArray(registrants) || registrants.length === 0) {
    return res.status(400).json({ error: 'registrants must be a non-empty array' });
  }
  if (registrants.length > 100) {
    return res.status(400).json({ error: 'Bulk groups are capped at 100 people per payment' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const inserted = [];
    for (const r of registrants) {
      const {
        firstName, middleName, lastName, name, dob, dccZone, assemblyName, denomination, gender,
        phone, email, state, status, occupation, qualification, uniqueCode, amount,
      } = r;

      const result = await client.query(
        `INSERT INTO registrations
          (first_name, middle_name, last_name, name, dob, dcc_zone, assembly_name, denomination, gender,
           phone, email, state, status, occupation, qualification,
           unique_code, tx_ref, amount, payment_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         RETURNING *`,
        [
          firstName, middleName || null, lastName, name, dob, dccZone, assemblyName || null,
          denomination || null, gender, phone, email, state, status, occupation, qualification,
          uniqueCode, txRef, amount || 3100, 'pending',
        ]
      );
      inserted.push(toReg(result.rows[0]));
    }

    await client.query('COMMIT');
    res.status(201).json(inserted);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Bulk create registration error:', err);
    res.status(500).json({ error: 'Failed to save group registration' });
  } finally {
    client.release();
  }
});

// POST /api/registrations/resume — check payment status and return data needed to resume payment.
// Returns: { status: 'paid' } | { status: 'pending', name, email, phone, state, txRef, uniqueCode, amount } | { status: 'not_found' }
router.post('/resume', async (req, res) => {
  const { email, phone } = req.body || {};
  if (!email && !phone) return res.status(400).json({ error: 'Provide email or phone' });

  try {
    const paid = email
      ? await pool.query(
          `SELECT id FROM registrations WHERE LOWER(email) = LOWER($1) AND payment_status = 'success' LIMIT 1`,
          [email.trim()]
        )
      : await pool.query(
          `SELECT id FROM registrations WHERE phone = $1 AND payment_status = 'success' LIMIT 1`,
          [phone.trim()]
        );

    if (paid.rows.length > 0) return res.json({ status: 'paid' });

    // Bulk-group rows (shared tx_ref across many people) are excluded here on purpose:
    // resuming one person's payment individually would let them pay a single person's
    // fee while the webhook's tx_ref match flips the WHOLE group to 'success'.
    const pending = email
      ? await pool.query(
          `SELECT name, email, phone, state, tx_ref, unique_code, amount
           FROM registrations WHERE LOWER(email) = LOWER($1) AND payment_status = 'pending'
           AND tx_ref NOT LIKE 'CACBULK-%'
           ORDER BY registered_at DESC LIMIT 1`,
          [email.trim()]
        )
      : await pool.query(
          `SELECT name, email, phone, state, tx_ref, unique_code, amount
           FROM registrations WHERE phone = $1 AND payment_status = 'pending'
           AND tx_ref NOT LIKE 'CACBULK-%'
           ORDER BY registered_at DESC LIMIT 1`,
          [phone.trim()]
        );

    if (pending.rows.length > 0) {
      const row = pending.rows[0];
      return res.json({
        status: 'pending',
        txRef: row.tx_ref,
        uniqueCode: row.unique_code,
        amount: row.amount,
      });
    }

    return res.json({ status: 'not_found' });
  } catch (err) {
    console.error('Resume lookup error:', err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// POST /api/registrations/resend — public recovery: resend slip(s) by phone or email.
// One contact may cover multiple registrants, and the same email may also belong
// to a vendor registration — resendAllSlips() covers both registrations and
// vendors and sends one combined email so nothing is missed.
router.post('/resend', async (req, res) => {
  const { email, phone } = req.body || {};
  if (!email && !phone) return res.status(400).json({ error: 'Provide email or phone' });

  try {
    resendAllSlips({ email, phone }).catch(err => console.error('Resend failed:', err.message));

    // Always respond generically — don't reveal whether any record was found
    res.json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Failed to resend slip' });
  }
});

// POST /api/registrations/lookup — find by unique code (admin or staff)
router.post('/lookup', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  const staffId  = req.headers['x-staff-id'];
  if (!adminKey && !staffId) return res.status(401).json({ error: 'Unauthorized' });
  if (adminKey && adminKey !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });

  const { code } = req.body;
  if (!code?.trim()) return res.status(400).json({ error: 'Code is required' });

  try {
    const result = await pool.query(
      'SELECT * FROM registrations WHERE UPPER(unique_code) = UPPER($1)',
      [code.trim()]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Registration not found' });
    const reg = result.rows[0];

    if (staffId) {
      const staffRow = await pool.query('SELECT state FROM staff WHERE id = $1', [staffId]);
      if (staffRow.rows.length === 0) return res.status(401).json({ error: 'Unauthorized' });
      if (staffRow.rows[0].state !== reg.state) {
        return res.status(403).json({ error: 'This registrant belongs to a different state' });
      }
    }

    res.json(toReg(reg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// POST /api/registrations/bulk/send-slips — SSE stream, pushes progress as batches complete
router.post('/bulk/send-slips', requireAdmin, async (req, res) => {
  const { message: customMessage } = req.body || {};
  // SSE headers — keep the connection alive, stream events as batches complete
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const push = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const result = await pool.query(
      `SELECT * FROM registrations WHERE payment_status = 'success' ORDER BY registered_at ASC`
    );
    const rows = result.rows.map(toReg).filter(r => r.email);
    const total = rows.length;

    push({ type: 'start', total });

    const BATCH_SIZE = 50;
    const BATCH_DELAY = 300;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(reg => sendSlipEmail(reg, null, customMessage)));
      results.forEach(r => r.status === 'fulfilled' ? sent++ : failed++);
      push({ type: 'progress', sent, failed, total, pct: Math.round(((sent + failed) / total) * 100) });

      if (i + BATCH_SIZE < rows.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    push({ type: 'done', sent, failed, total });
  } catch (err) {
    console.error('Bulk send error:', err);
    push({ type: 'error', message: err.message });
  } finally {
    res.end();
  }
});

// GET /api/registrations — all registrations (admin only)
router.get('/', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM registrations ORDER BY registered_at DESC');
    res.json(result.rows.map(toReg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// GET /api/registrations/duplicate-drafts — admin only.
// Finds every non-paid row (pending/abandoned) whose same phone+name already
// has a *different* row marked payment_status='success'. These are leftover
// duplicates from someone retrying registration after they'd already paid —
// safe to review and delete since the person is already registered under the
// paid row.
router.get('/duplicate-drafts', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (r.id)
        r.id, r.name, r.phone, r.email, r.tx_ref, r.payment_status, r.unique_code, r.registered_at,
        p.id AS paid_id, p.unique_code AS paid_unique_code
      FROM registrations r
      JOIN registrations p
        ON p.phone = r.phone AND LOWER(p.name) = LOWER(r.name)
        AND p.payment_status = 'success' AND p.id <> r.id
      WHERE r.payment_status != 'success'
      ORDER BY r.id, p.id
    `);
    res.json(result.rows.map(row => ({
      id: String(row.id),
      name: row.name,
      phone: row.phone,
      email: row.email,
      txRef: row.tx_ref,
      paymentStatus: row.payment_status,
      uniqueCode: row.unique_code,
      registeredAt: row.registered_at,
      paidId: String(row.paid_id),
      paidUniqueCode: row.paid_unique_code,
    })));
  } catch (err) {
    console.error('Duplicate drafts lookup error:', err);
    res.status(500).json({ error: 'Failed to find duplicate drafts' });
  }
});

// GET /api/registrations/state/:state — registrations by state (staff)
router.get('/state/:state', async (req, res) => {
  const staffId = req.headers['x-staff-id'];
  if (!staffId) return res.status(401).json({ error: 'Unauthorized' });

  const { state } = req.params;
  try {
    const staffRow = await pool.query('SELECT state FROM staff WHERE id = $1', [staffId]);
    if (staffRow.rows.length === 0 || staffRow.rows[0].state !== state) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const result = await pool.query(
      'SELECT * FROM registrations WHERE state = $1 ORDER BY registered_at DESC',
      [state]
    );
    res.json(result.rows.map(toReg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// GET /api/registrations/by-code/:code — public, returns slip-safe fields only (no payment data).
// Only returns records with a successful payment so unpaid drafts cannot generate a slip.
router.get('/by-code/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query(
      `SELECT name, unique_code, state, dcc_zone, assembly_name, denomination, phone
       FROM registrations WHERE UPPER(unique_code) = UPPER($1) AND payment_status = 'success'`,
      [code.trim()]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Registration not found' });
    const row = result.rows[0];
    res.json({
      name: row.name,
      uniqueCode: row.unique_code,
      state: row.state,
      dccZone: row.dcc_zone,
      assemblyName: row.assembly_name,
      denomination: row.denomination,
      phone: row.phone,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// PATCH /api/registrations/:id/verify — toggle verified (admin or staff)
router.patch('/:id/verify', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  const staffId = req.headers['x-staff-id'];

  if (!adminKey && !staffId) return res.status(401).json({ error: 'Unauthorized' });
  if (adminKey && adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  try {
    const current = await pool.query('SELECT verified, state FROM registrations WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    if (staffId) {
      const staffRow = await pool.query('SELECT state FROM staff WHERE id = $1', [staffId]);
      if (staffRow.rows.length === 0) return res.status(401).json({ error: 'Unauthorized' });
      if (staffRow.rows[0].state !== current.rows[0].state) {
        return res.status(403).json({ error: 'Cannot verify registrant from a different state' });
      }
    }

    const wasVerified = current.rows[0].verified;
    const result = await pool.query(
      'UPDATE registrations SET verified = $1, verified_at = $2 WHERE id = $3 RETURNING *',
      [!wasVerified, !wasVerified ? new Date().toISOString() : null, id]
    );
    res.json(toReg(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update registration' });
  }
});

// POST /api/registrations/:id/send-slip — send slip to a specific registrant (admin only)
router.post('/:id/send-slip', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { email: overrideEmail, message: customMessage } = req.body || {};

  try {
    const result = await pool.query('SELECT * FROM registrations WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Registration not found' });

    const reg = toReg(result.rows[0]);
    const targetEmail = overrideEmail?.trim() || reg.email;

    if (!targetEmail) return res.status(400).json({ error: 'No email address available' });

    await sendSlipEmail(reg, targetEmail, customMessage);
    res.json({ success: true, sentTo: targetEmail });
  } catch (err) {
    console.error('Send slip error:', err);
    res.status(500).json({ error: 'Failed to send slip email' });
  }
});

// DELETE /api/registrations/:id (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM registrations WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete registration' });
  }
});

module.exports = router;
