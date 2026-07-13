const pool = require('../db');
const {
  sendSlipEmail, sendVendorSlipEmail, sendCombinedSummaryEmail,
} = require('./email');

const toRegRow = (row) => ({
  name: row.name,
  state: row.state,
  dccZone: row.dcc_zone,
  phone: row.phone,
  email: row.email,
  uniqueCode: row.unique_code,
});

const toVendorRow = (row) => ({
  name: row.name,
  businessName: row.business_name,
  category: row.category,
  phone: row.phone,
  email: row.email,
  uniqueCode: row.unique_code,
  amount: row.amount,
});

// Looks up every PAID registration and vendor record tied to an email or phone,
// then sends a single email covering all of them. One email may legitimately
// cover several different people, and the same email may belong to both a
// participant and a vendor — so "already registered? get your slip" always
// returns everything in one place, no matter which tab (Participant or Vendor)
// it was clicked from.
async function resendAllSlips({ email, phone }) {
  const regResult = email
    ? await pool.query(
        `SELECT * FROM registrations WHERE LOWER(email) = LOWER($1) AND payment_status = 'success' ORDER BY registered_at ASC`,
        [email.trim()]
      )
    : await pool.query(
        `SELECT * FROM registrations WHERE phone = $1 AND payment_status = 'success' ORDER BY registered_at ASC`,
        [phone.trim()]
      );

  const vendorResult = email
    ? await pool.query(
        `SELECT * FROM vendors WHERE LOWER(email) = LOWER($1) AND payment_status = 'success' ORDER BY registered_at ASC`,
        [email.trim()]
      )
    : await pool.query(
        `SELECT * FROM vendors WHERE phone = $1 AND payment_status = 'success' ORDER BY registered_at ASC`,
        [phone.trim()]
      );

  const regs = regResult.rows.map(toRegRow);
  const vendors = vendorResult.rows.map(toVendorRow);
  const total = regs.length + vendors.length;

  const toEmail = regs[0]?.email || vendors[0]?.email;
  if (!toEmail || total === 0) return { sent: false };

  if (total === 1) {
    if (regs.length === 1) await sendSlipEmail(regs[0]);
    else await sendVendorSlipEmail(vendors[0]);
  } else {
    await sendCombinedSummaryEmail(regs, vendors, toEmail);
  }

  return { sent: true };
}

module.exports = { resendAllSlips };
