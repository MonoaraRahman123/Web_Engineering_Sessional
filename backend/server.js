const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/startups', require('./routes/startupRoutes'));

// Health / Welcome Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'Top Bangladeshi EdTech Startups Leaderboard API',
    endpoints: {
      authLogin: 'POST /api/auth/login',
      authVerify: 'GET /api/auth/verify',
      getStartups: 'GET /api/startups',
      getStartupById: 'GET /api/startups/:id',
      createStartup: 'POST /api/startups (Protected)',
      updateStartup: 'PUT /api/startups/:id (Protected)',
      deleteStartup: 'DELETE /api/startups/:id (Protected)',
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
