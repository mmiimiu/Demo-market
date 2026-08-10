const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the Next.js frontend can connect
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Basic API Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PrimeRent Backend API is running smoothly.' });
});

// Mock endpoint for system test
app.get('/api/contracts/test', (req, res) => {
  res.json({ message: 'Connected to external backend successfully' });
});

app.listen(PORT, () => {
  console.log(`Backend API Server running on port ${PORT}`);
});
