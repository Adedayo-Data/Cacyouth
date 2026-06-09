const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const pool = require('../db');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@mryc.online';
const APP_URL = process.env.APP_URL || 'https://mryc.online';

const STATE_LABELS = {
  FCT: 'FCT — Abuja',
  NIGER: 'Niger State',
  KADUNA: 'Kaduna State',
};

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

function buildSlipEmail(reg, overrideEmail) {
  const stateLabel = reg.state === 'OTHER' && reg.dccZone
    ? `${reg.dccZone} State`
    : (STATE_LABELS[reg.state] ?? reg.state);

  const zoneRow = reg.dccZone
    ? `<tr><td style="color:#6b7280;font-size:14px;padding-bottom:10px;padding-right:16px;">Zone / DCC</td><td style="color:#111827;font-size:14px;font-weight:700;padding-bottom:10px;">${reg.dccZone}</td></tr>`
    : '';

  const assemblyRow = reg.assemblyName
    ? `<tr><td style="color:#6b7280;font-size:14px;padding-bottom:10px;padding-right:16px;">Assembly / District</td><td style="color:#111827;font-size:14px;font-weight:700;padding-bottom:10px;">${reg.assemblyName}</td></tr>`
    : '';

  const denominationRow = reg.denomination
    ? `<tr><td style="color:#6b7280;font-size:14px;padding-bottom:10px;padding-right:16px;">Church / Denomination</td><td style="color:#111827;font-size:14px;font-weight:700;padding-bottom:10px;">${reg.denomination}</td></tr>`
    : '';

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
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#7c3aed;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">
              Christ Apostolic Church
            </h1>
            <p style="margin:6px 0 0;color:#ddd6fe;font-size:12px;letter-spacing:1px;text-transform:uppercase;">
              Youth Fellowship · Medaiyese Region
            </p>
          </td>
        </tr>

        <!-- Sub-header -->
        <tr>
          <td style="background:#6d28d9;padding:12px 40px;text-align:center;">
            <p style="margin:0;color:#ede9fe;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
              2026 Youth Conference · Registration Slip
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 6px;color:#7c3aed;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
              Registration Confirmed
            </p>
            <h2 style="margin:0 0 24px;color:#111827;font-size:22px;font-weight:900;">
              Hello, ${reg.name}!
            </h2>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
              Your registration for the <strong>2026 CAC Youth Fellowship Annual Conference</strong>
              has been confirmed. Keep this slip safe — you will need your
              <strong>Registration ID</strong> to enter the venue.
            </p>

            <!-- Details box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 16px;color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                    Your Registration Details
                  </p>
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="color:#6b7280;font-size:14px;padding-bottom:10px;padding-right:16px;">Full Name</td>
                      <td style="color:#111827;font-size:14px;font-weight:700;padding-bottom:10px;">${reg.name}</td>
                    </tr>
                    <tr>
                      <td style="color:#6b7280;font-size:14px;padding-bottom:10px;padding-right:16px;">State</td>
                      <td style="color:#111827;font-size:14px;font-weight:700;padding-bottom:10px;">${stateLabel}</td>
                    </tr>
                    ${zoneRow}
                    ${assemblyRow}
                    ${denominationRow}
                    <tr>
                      <td style="color:#6b7280;font-size:14px;padding-right:16px;">Phone</td>
                      <td style="color:#111827;font-size:14px;font-weight:700;">${reg.phone ?? '—'}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Registration code -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border:2px dashed #c4b5fd;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:28px 20px;text-align:center;">
                  <p style="margin:0 0 12px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">
                    Registration ID
                  </p>
                  <p style="margin:0;font-family:monospace;font-size:28px;font-weight:900;letter-spacing:4px;color:#1f2937;word-break:break-all;">
                    ${reg.uniqueCode}
                  </p>
                  <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;">
                    Present this code at the venue for verification
                  </p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="${APP_URL}/conference/slip"
                    style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:8px;">
                    View &amp; Print Your Slip →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
              You can also screenshot this email for easy access at the venue.
              If you have any questions, please reach out to your DCC/Zone coordinator.
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

  return {
    from: FROM_EMAIL,
    to: overrideEmail || reg.email,
    subject: `Your 2026 CAC Youth Conference Registration Slip — ${reg.uniqueCode}`,
    html,
  };
}

async function sendSlipEmail(reg, overrideEmail) {
  return resend.emails.send(buildSlipEmail(reg, overrideEmail));
}

// POST /api/registrations — create (no auth, called after payment)
router.post('/', async (req, res) => {
  const {
    firstName, middleName, lastName, name, dob, dccZone, assemblyName, denomination, gender,
    phone, email, state, status, occupation, qualification,
    uniqueCode, paymentRef, txRef, amount,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO registrations
        (first_name, middle_name, last_name, name, dob, dcc_zone, assembly_name, denomination, gender,
         phone, email, state, status, occupation, qualification,
         unique_code, payment_ref, tx_ref, amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [
        firstName, middleName || null, lastName, name, dob, dccZone, assemblyName || null,
        denomination || null, gender, phone, email, state, status, occupation, qualification,
        uniqueCode, paymentRef || null, txRef || null, amount || 3100,
      ]
    );
    const reg = toReg(result.rows[0]);

    // Send slip email in background — never fail the registration if this errors
    sendSlipEmail(reg).catch(err => console.error('Slip email failed:', err.message));

    res.status(201).json(reg);
  } catch (err) {
    console.error('Create registration error:', err);
    res.status(500).json({ error: 'Failed to save registration' });
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

// POST /api/registrations/bulk/send-slips — send slip emails to all registrants (admin only)
// Returns 202 immediately and processes batches in the background to avoid HTTP timeouts.
router.post('/bulk/send-slips', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM registrations ORDER BY registered_at ASC');
    const rows = result.rows.map(toReg).filter(r => r.email);

    // Respond immediately so the browser doesn't time out
    res.status(202).json({ started: true, total: rows.length });

    // Process in background — batches of 50, 300ms gap between batches to respect Resend rate limits
    const BATCH_SIZE = 50;
    const BATCH_DELAY = 300;

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map(reg => sendSlipEmail(reg)));
      results.forEach(r => r.status === 'fulfilled' ? sent++ : failed++);
      console.log(`Bulk slip send: batch ${Math.floor(i / BATCH_SIZE) + 1} done — ${sent} sent, ${failed} failed so far`);
      if (i + BATCH_SIZE < rows.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    console.log(`Bulk slip send complete: ${sent} sent, ${failed} failed out of ${rows.length}`);
  } catch (err) {
    console.error('Bulk send error:', err);
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
  const { email: overrideEmail } = req.body; // optional override

  try {
    const result = await pool.query('SELECT * FROM registrations WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Registration not found' });

    const reg = toReg(result.rows[0]);
    const targetEmail = overrideEmail?.trim() || reg.email;

    if (!targetEmail) return res.status(400).json({ error: 'No email address available' });

    await sendSlipEmail(reg, targetEmail);
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
