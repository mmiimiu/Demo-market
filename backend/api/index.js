const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS so the Next.js frontend can connect
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Welcome to PrimeRent Backend API.' });
});

// Basic API Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PrimeRent Backend API is running smoothly.' });
});

// Mock endpoint for system test
app.get('/api/contracts/test', (req, res) => {
  res.json({ message: 'Connected to external backend successfully' });
});

// Export for Vercel Serverless
module.exports = app;
