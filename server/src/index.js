require('dotenv').config();
const express = require('express');
const cors = require('cors');

const registrationsRouter = require('./routes/registrations');
const staffRouter = require('./routes/staff');
const paymentRouter = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/registrations', registrationsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/payment', paymentRouter);

app.listen(PORT, () => {
  console.log(`CAC Youth API running on port ${PORT}`);
});
