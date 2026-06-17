const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@mryc.online';
const APP_URL = process.env.APP_URL || 'https://mryc.online';

const STATE_LABELS = {
  FCT: 'FCT — Abuja',
  NIGER: 'Niger State',
  KADUNA: 'Kaduna State',
};

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildSlipEmail(reg, overrideEmail, customMessage) {
  const stateLabel = esc(
    reg.state === 'OTHER' && reg.dccZone
      ? `${reg.dccZone} State`
      : (STATE_LABELS[reg.state] ?? reg.state)
  );

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

        <tr>
          <td style="background:#6d28d9;padding:12px 40px;text-align:center;">
            <p style="margin:0;color:#ede9fe;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
              2026 Youth Conference · Registration Slip
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 6px;color:#7c3aed;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
              Registration Confirmed
            </p>
            <h2 style="margin:0 0 24px;color:#111827;font-size:22px;font-weight:900;">
              Hello, ${esc(reg.name)}!
            </h2>
            <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
              Your registration for the <strong>2026 CAC Youth Fellowship Annual Conference</strong>
              has been confirmed. Keep this slip safe — you will need your
              <strong>Registration ID</strong> to enter the venue.
            </p>

            ${customMessage ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:18px 22px;">
                  <p style="margin:0 0 6px;color:#92400e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                    Message from the Organisers
                  </p>
                  <p style="margin:0;color:#78350f;font-size:14px;line-height:1.7;white-space:pre-wrap;">${customMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                </td>
              </tr>
            </table>` : ''}

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 16px;color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                    Your Registration Details
                  </p>
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="color:#6b7280;font-size:14px;padding-bottom:10px;padding-right:16px;">Full Name</td>
                      <td style="color:#111827;font-size:14px;font-weight:700;padding-bottom:10px;">${esc(reg.name)}</td>
                    </tr>
                    <tr>
                      <td style="color:#6b7280;font-size:14px;padding-bottom:10px;padding-right:16px;">State</td>
                      <td style="color:#111827;font-size:14px;font-weight:700;padding-bottom:10px;">${stateLabel}</td>
                    </tr>
                    <tr>
                      <td style="color:#6b7280;font-size:14px;padding-right:16px;">Phone</td>
                      <td style="color:#111827;font-size:14px;font-weight:700;">${esc(reg.phone ?? '—')}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border:2px dashed #c4b5fd;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:28px 20px;text-align:center;">
                  <p style="margin:0 0 12px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">
                    Registration ID
                  </p>
                  <p style="margin:0;font-family:monospace;font-size:28px;font-weight:900;letter-spacing:4px;color:#1f2937;word-break:break-all;">
                    ${esc(reg.uniqueCode)}
                  </p>
                  <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;">
                    Present this code at the venue for verification
                  </p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="${APP_URL}/conference/slip?code=${encodeURIComponent(reg.uniqueCode)}"
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

async function sendSlipEmail(reg, overrideEmail, customMessage) {
  return resend.emails.send(buildSlipEmail(reg, overrideEmail, customMessage));
}

// Sent when one contact (email/phone) has multiple registrations.
// Lists every registrant with their code and a "View Slip" link in one email.
function buildSummaryEmail(regs, toEmail) {
  const rows = regs.map(reg => {
    const stateLabel = esc(
      reg.state === 'OTHER' && reg.dccZone
        ? `${reg.dccZone} State`
        : (STATE_LABELS[reg.state] ?? reg.state)
    );

    return `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;font-weight:600;">
          ${esc(reg.name)}
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;">
          ${stateLabel}
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;">
          <span style="font-family:monospace;font-size:13px;font-weight:700;letter-spacing:2px;color:#1f2937;">
            ${esc(reg.uniqueCode)}
          </span>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;text-align:center;">
          <a href="${APP_URL}/conference/slip?code=${encodeURIComponent(reg.uniqueCode)}"
            style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;padding:8px 16px;border-radius:6px;">
            View Slip
          </a>
        </td>
      </tr>`;
  }).join('');

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
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

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

        <tr>
          <td style="background:#6d28d9;padding:12px 40px;text-align:center;">
            <p style="margin:0;color:#ede9fe;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
              2026 Youth Conference · Registration Summary
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 6px;color:#7c3aed;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
              All Registrations
            </p>
            <h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:900;">
              Your ${regs.length} Registration${regs.length > 1 ? 's' : ''}
            </h2>
            <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.6;">
              Here are all the registrations linked to your contact details.
              Each person needs their <strong>Registration ID</strong> to enter the venue.
              Click <strong>View Slip</strong> to open and print any individual slip.
            </p>

            <!-- Registrants table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:28px;">
              <thead>
                <tr style="background:#f9fafb;">
                  <th style="padding:12px 16px;text-align:left;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;">Name</th>
                  <th style="padding:12px 16px;text-align:left;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;">State</th>
                  <th style="padding:12px 16px;text-align:left;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;">Registration ID</th>
                  <th style="padding:12px 16px;text-align:center;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #e5e7eb;">Slip</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

            <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
              Screenshot or print each slip before arriving at the venue.
              If you have any questions, reach out to your DCC/Zone coordinator.
            </p>
          </td>
        </tr>

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
    to: toEmail,
    subject: `Your 2026 CAC Youth Conference Registrations (${regs.length} ${regs.length > 1 ? 'people' : 'person'})`,
    html,
  };
}

async function sendSummaryEmail(regs, toEmail) {
  return resend.emails.send(buildSummaryEmail(regs, toEmail));
}

module.exports = { buildSlipEmail, sendSlipEmail, buildSummaryEmail, sendSummaryEmail, STATE_LABELS };
