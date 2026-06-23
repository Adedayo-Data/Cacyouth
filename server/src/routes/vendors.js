const express = require('express');
const router = express.Router();
const pool = require('../db');

const toVendor = (row) => ({
  id: String(row.id),
  firstName: row.first_name,
  lastName: row.last_name,
  name: row.name,
  businessName: row.business_name,
  phone: row.phone,
  email: row.email,
  category: row.category,
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

const requireStaff = async (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const staffId  = req.headers['x-staff-id'];
  if (!adminKey && !staffId) return res.status(401).json({ error: 'Unauthorized' });
  if (adminKey && adminKey !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  if (staffId) {
    try {
      const row = await pool.query('SELECT id FROM staff WHERE id = $1', [staffId]);
      if (row.rows.length === 0) return res.status(401).json({ error: 'Unauthorized' });
    } catch {
      return res.status(500).json({ error: 'Auth check failed' });
    }
  }
  next();
};

// POST /api/vendors — pre-save pending vendor registration before payment
router.post('/', async (req, res) => {
  const { firstName, lastName, name, businessName, phone, email, category, uniqueCode, txRef, amount } = req.body;

  try {
    if (txRef) {
      const existing = await pool.query('SELECT * FROM vendors WHERE tx_ref = $1', [txRef]);
      if (existing.rows.length > 0) return res.status(200).json(toVendor(existing.rows[0]));
    }

    const result = await pool.query(
      `INSERT INTO vendors
         (first_name, last_name, name, business_name, phone, email, category, unique_code, tx_ref, amount, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
       RETURNING *`,
      [firstName, lastName, name, businessName, phone || null, email || null, category, uniqueCode, txRef || null, amount || 0]
    );
    res.status(201).json(toVendor(result.rows[0]));
  } catch (err) {
    console.error('Create vendor error:', err);
    res.status(500).json({ error: 'Failed to save vendor registration' });
  }
});

// POST /api/vendors/resume — check payment status by phone/email
router.post('/resume', async (req, res) => {
  const { email, phone } = req.body || {};
  if (!email && !phone) return res.status(400).json({ error: 'Provide email or phone' });

  try {
    const paid = email
      ? await pool.query(
          `SELECT id FROM vendors WHERE LOWER(email) = LOWER($1) AND payment_status = 'success' LIMIT 1`,
          [email.trim()]
        )
      : await pool.query(
          `SELECT id FROM vendors WHERE phone = $1 AND payment_status = 'success' LIMIT 1`,
          [phone.trim()]
        );

    if (paid.rows.length > 0) return res.json({ status: 'paid' });

    const pending = email
      ? await pool.query(
          `SELECT tx_ref, unique_code, amount FROM vendors WHERE LOWER(email) = LOWER($1) AND payment_status = 'pending' ORDER BY registered_at DESC LIMIT 1`,
          [email.trim()]
        )
      : await pool.query(
          `SELECT tx_ref, unique_code, amount FROM vendors WHERE phone = $1 AND payment_status = 'pending' ORDER BY registered_at DESC LIMIT 1`,
          [phone.trim()]
        );

    if (pending.rows.length > 0) {
      const row = pending.rows[0];
      return res.json({ status: 'pending', txRef: row.tx_ref, uniqueCode: row.unique_code, amount: row.amount });
    }

    return res.json({ status: 'not_found' });
  } catch (err) {
    console.error('Vendor resume error:', err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// POST /api/vendors/lookup — find by code (staff or admin, no state restriction)
router.post('/lookup', requireStaff, async (req, res) => {
  const { code } = req.body;
  if (!code?.trim()) return res.status(400).json({ error: 'Code is required' });

  try {
    const result = await pool.query(
      'SELECT * FROM vendors WHERE UPPER(unique_code) = UPPER($1)',
      [code.trim()]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json(toVendor(result.rows[0]));
  } catch (err) {
    console.error('Vendor lookup error:', err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// GET /api/vendors/by-code/:code — public, slip-safe fields only, paid only
router.get('/by-code/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query(
      `SELECT name, business_name, category, phone, email, unique_code, amount
       FROM vendors WHERE UPPER(unique_code) = UPPER($1) AND payment_status = 'success'`,
      [code.trim()]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vendor not found' });
    const row = result.rows[0];
    res.json({
      name: row.name,
      businessName: row.business_name,
      category: row.category,
      phone: row.phone,
      email: row.email,
      uniqueCode: row.unique_code,
      amount: row.amount,
    });
  } catch (err) {
    console.error('Vendor by-code error:', err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// PATCH /api/vendors/:id/verify — toggle verified (staff or admin)
router.patch('/:id/verify', requireStaff, async (req, res) => {
  const { id } = req.params;
  try {
    const current = await pool.query('SELECT verified FROM vendors WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const wasVerified = current.rows[0].verified;
    const result = await pool.query(
      'UPDATE vendors SET verified = $1, verified_at = $2 WHERE id = $3 RETURNING *',
      [!wasVerified, !wasVerified ? new Date().toISOString() : null, id]
    );
    res.json(toVendor(result.rows[0]));
  } catch (err) {
    console.error('Vendor verify error:', err);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// GET /api/vendors — all vendors (admin only)
router.get('/', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vendors ORDER BY registered_at DESC');
    res.json(result.rows.map(toVendor));
  } catch (err) {
    console.error('Fetch vendors error:', err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// DELETE /api/vendors/:id (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM vendors WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete vendor error:', err);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

module.exports = router;
