const express = require('express');
const router = express.Router();
const pool = require('../db');
const { sendSlipEmail, sendSummaryEmail } = require('../utils/email');

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

// POST /api/registrations — create (called before payment with status='pending',
// or as fallback with status='success' if pre-save failed)
router.post('/', async (req, res) => {
  const {
    firstName, middleName, lastName, name, dob, dccZone, assemblyName, denomination, gender,
    phone, email, state, status, occupation, qualification,
    uniqueCode, paymentRef, txRef, amount, paymentStatus,
  } = req.body;

  const resolvedStatus = paymentStatus || 'pending';

  try {
    const result = await pool.query(
      `INSERT INTO registrations
        (first_name, middle_name, last_name, name, dob, dcc_zone, assembly_name, denomination, gender,
         phone, email, state, status, occupation, qualification,
         unique_code, payment_ref, tx_ref, amount, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       RETURNING *`,
      [
        firstName, middleName || null, lastName, name, dob, dccZone, assemblyName || null,
        denomination || null, gender, phone, email, state, status, occupation, qualification,
        uniqueCode, paymentRef || null, txRef || null, amount || 3100, resolvedStatus,
      ]
    );
    const reg = toReg(result.rows[0]);

    // Only send email when payment is already confirmed (fallback path)
    if (resolvedStatus === 'success' && reg.email) {
      sendSlipEmail(reg).catch(err => console.error('Slip email failed:', err.message));
    }

    res.status(201).json(reg);
  } catch (err) {
    console.error('Create registration error:', err);
    res.status(500).json({ error: 'Failed to save registration' });
  }
});

// POST /api/registrations/resend — public recovery: resend slip(s) by phone or email.
// One adult may register multiple kids under the same contact, so we collect all
// successful registrations. If there's just one we send the normal slip; if more,
// we send a single consolidated summary so the inbox isn't flooded.
router.post('/resend', async (req, res) => {
  const { email, phone } = req.body || {};
  if (!email && !phone) return res.status(400).json({ error: 'Provide email or phone' });

  try {
    const result = email
      ? await pool.query(
          `SELECT * FROM registrations WHERE LOWER(email) = LOWER($1) AND payment_status = 'success' ORDER BY registered_at ASC`,
          [email.trim()]
        )
      : await pool.query(
          `SELECT * FROM registrations WHERE phone = $1 AND payment_status = 'success' ORDER BY registered_at ASC`,
          [phone.trim()]
        );

    if (result.rows.length > 0) {
      const regs = result.rows.map(toReg);
      const toEmail = regs[0].email;

      if (toEmail) {
        if (regs.length === 1) {
          sendSlipEmail(regs[0]).catch(err => console.error('Resend failed:', err.message));
        } else {
          sendSummaryEmail(regs, toEmail).catch(err => console.error('Summary resend failed:', err.message));
        }
      }
    }

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
    const result = await pool.query('SELECT * FROM registrations ORDER BY registered_at ASC');
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

// GET /api/registrations/by-code/:code — public, returns slip-safe fields only (no payment data)
router.get('/by-code/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query(
      `SELECT name, unique_code, state, dcc_zone, assembly_name, denomination, phone
       FROM registrations WHERE UPPER(unique_code) = UPPER($1)`,
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
