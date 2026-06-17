require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pool = require('./db');

const registrationsRouter = require('./routes/registrations');
const staffRouter = require('./routes/staff');
const paymentRouter = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://mryc.online').split(',').map(o => o.trim());
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// ── API routes ────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/registrations', registrationsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/payment', paymentRouter);

// ── Serve the Vite frontend build ─────────────────────────────────────────────
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Auto-run schema on startup ────────────────────────────────────────────────
async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('Database schema ready');
}

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`CAC Youth server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialise database:', err.message);
    process.exit(1);
  });
