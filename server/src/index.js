require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const registrationsRouter = require('./routes/registrations');
const staffRouter = require('./routes/staff');
const paymentRouter = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── API routes ────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/registrations', registrationsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/payment', paymentRouter);

// ── Serve the Vite frontend build ─────────────────────────────────────────────
// In production Railway serves both from the same process.
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

// SPA fallback — any non-API route returns index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CAC Youth server running on port ${PORT}`);
});
