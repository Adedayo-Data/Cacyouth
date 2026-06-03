const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const pool = require('../db');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@mryc.online';
const APP_URL = process.env.APP_URL || 'https://mryc.online';

const toStaff = (row) => ({
  id: String(row.id),
  name: row.name,
  email: row.email,
  username: row.username,
  state: row.state,
  mustChangePassword: row.must_change_password,
  createdAt: row.created_at,
});

const requireAdmin = (req, res, next) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
  let pwd = '';
  for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

function generateUsername(name) {
  const base = name.trim().split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}${suffix}`;
}

const STATE_LABELS = {
  FCT: 'FCT (Abuja)',
  NIGER: 'Niger State',
  KADUNA: 'Kaduna State',
  OTHER: 'Other States',
};

async function sendWelcomeEmail({ name, email, username, password, state }) {
  const stateLabel = STATE_LABELS[state] || state;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#7c3aed;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">
              Christ Apostolic Church
            </h1>
            <p style="margin:6px 0 0;color:#ddd6fe;font-size:13px;letter-spacing:1px;text-transform:uppercase;">
              Youth Fellowship · Medaiyese Region
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 8px;color:#7c3aed;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
              Staff Appointment
            </p>
            <h2 style="margin:0 0 20px;color:#111827;font-size:22px;font-weight:900;">
              Welcome to the Team, ${name}!
            </h2>
            <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
              You have been appointed as a <strong>Verification Staff Member</strong> for the
              <strong>2026 CAC Youth Fellowship Annual Conference</strong>.
              Your role is to verify registered candidates at the venue for
              <strong>${stateLabel}</strong>.
            </p>

            <!-- Credentials box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 16px;color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                    Your Login Credentials
                  </p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color:#6b7280;font-size:14px;padding-bottom:10px;padding-right:16px;">Username</td>
                      <td style="color:#111827;font-size:14px;font-weight:700;padding-bottom:10px;font-family:monospace;">${username}</td>
                    </tr>
                    <tr>
                      <td style="color:#6b7280;font-size:14px;padding-bottom:10px;padding-right:16px;">Password</td>
                      <td style="color:#111827;font-size:14px;font-weight:700;padding-bottom:10px;font-family:monospace;">${password}</td>
                    </tr>
                    <tr>
                      <td style="color:#6b7280;font-size:14px;padding-right:16px;">State</td>
                      <td style="color:#7c3aed;font-size:14px;font-weight:700;">${stateLabel}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Warning -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                    <strong>Important:</strong> You will be required to change your password
                    the first time you log in. Please keep your credentials safe and do not share them.
                  </p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <a href="${APP_URL}/staff"
                    style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:8px;">
                    Log In to Staff Portal →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
              If you have any questions, please contact the regional coordinator.
              We look forward to working with you at the conference.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              mryc.online · CAC Youth Fellowship Medaiyese Region · 2026 Annual Conference
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Staff Appointment — 2026 CAC Youth Fellowship Conference',
    html,
  });
}

// ── POST /api/staff/login ──────────────────────────────────────────────────
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
      mustChangePassword: staff.must_change_password ?? false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── PATCH /api/staff/change-password ──────────────────────────────────────
router.patch('/change-password', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }
  try {
    const result = await pool.query('SELECT * FROM staff WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Staff not found' });
    const staff = result.rows[0];
    if (staff.password !== currentPassword) return res.status(401).json({ error: 'Current password is incorrect' });
    await pool.query(
      'UPDATE staff SET password = $1, must_change_password = FALSE WHERE id = $2',
      [newPassword, staff.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Password change failed' });
  }
});

// ── GET /api/staff — list all (admin only) ─────────────────────────────────
router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff ORDER BY created_at DESC');
    res.json(result.rows.map(toStaff));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// ── POST /api/staff — create staff (admin only) ────────────────────────────
router.post('/', requireAdmin, async (req, res) => {
  const { name, email, state } = req.body;
  if (!name?.trim() || !email?.trim() || !state) {
    return res.status(400).json({ error: 'Name, email and state are required' });
  }

  const password = generatePassword();
  let username = generateUsername(name);

  // Ensure username is unique
  let attempt = 0;
  while (attempt < 5) {
    const existing = await pool.query('SELECT id FROM staff WHERE username = $1', [username]);
    if (existing.rows.length === 0) break;
    username = generateUsername(name);
    attempt++;
  }

  try {
    const result = await pool.query(
      'INSERT INTO staff (name, email, username, password, state, must_change_password) VALUES ($1,$2,$3,$4,$5,TRUE) RETURNING *',
      [name.trim(), email.trim(), username, password, state]
    );
    const created = toStaff(result.rows[0]);

    // Send welcome email — if it fails, still return success but flag it
    let emailSent = true;
    try {
      await sendWelcomeEmail({ name: name.trim(), email: email.trim(), username, password, state });
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr.message);
      emailSent = false;
    }

    res.status(201).json({ ...created, emailSent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create staff account' });
  }
});

// ── DELETE /api/staff/:id (admin only) ────────────────────────────────────
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
