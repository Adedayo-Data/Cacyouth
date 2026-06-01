const express = require('express');
const router = express.Router();
const pool = require('../db');

const toReg = (row) => ({
  id: String(row.id),
  firstName: row.first_name,
  middleName: row.middle_name,
  lastName: row.last_name,
  name: row.name,
  dob: row.dob,
  dccZone: row.dcc_zone,
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

// POST /api/registrations — create (no auth, called after payment)
router.post('/', async (req, res) => {
  const {
    firstName, middleName, lastName, name, dob, dccZone, gender,
    phone, email, state, status, occupation, qualification,
    uniqueCode, paymentRef, txRef, amount,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO registrations
        (first_name, middle_name, last_name, name, dob, dcc_zone, gender,
         phone, email, state, status, occupation, qualification,
         unique_code, payment_ref, tx_ref, amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        firstName, middleName || null, lastName, name, dob, dccZone, gender,
        phone, email, state, status, occupation, qualification,
        uniqueCode, paymentRef || null, txRef || null, amount || 3000,
      ]
    );
    res.status(201).json(toReg(result.rows[0]));
  } catch (err) {
    console.error('Create registration error:', err);
    res.status(500).json({ error: 'Failed to save registration' });
  }
});

// GET /api/registrations — all registrations (admin only)
router.get('/', requireAdmin, async (req, res) => {
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

    // Staff can only verify registrants from their own state
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
