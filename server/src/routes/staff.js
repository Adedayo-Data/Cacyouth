const express = require('express');
const router = express.Router();
const pool = require('../db');

const toStaff = (row) => ({
  id: String(row.id),
  name: row.name,
  username: row.username,
  password: row.password,
  state: row.state,
  createdAt: row.created_at,
});

const requireAdmin = (req, res, next) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// POST /api/staff/login — authenticate a staff member
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM staff WHERE username = $1', [username?.trim()]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid username or password' });
    const staff = result.rows[0];
    if (staff.password !== password) return res.status(401).json({ error: 'Invalid username or password' });
    res.json({
      id: String(staff.id),
      name: staff.name,
      username: staff.username,
      state: staff.state,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/staff — list all staff (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff ORDER BY created_at DESC');
    res.json(result.rows.map(toStaff));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// POST /api/staff — create a staff account (admin only)
router.post('/', requireAdmin, async (req, res) => {
  const { name, username, password, state } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM staff WHERE username = $1', [username?.trim()]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Username already taken' });

    const result = await pool.query(
      'INSERT INTO staff (name, username, password, state) VALUES ($1,$2,$3,$4) RETURNING *',
      [name?.trim(), username?.trim(), password?.trim(), state]
    );
    res.status(201).json(toStaff(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create staff account' });
  }
});

// DELETE /api/staff/:id (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM staff WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete staff account' });
  }
});

module.exports = router;
