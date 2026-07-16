const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const pool = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// CORS Configuration - Fix for preflight requests
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

console.log('🔧 Server Configuration:');
console.log(`   CORS Origins: ${JSON.stringify(corsOptions.origin)}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

// Middleware
app.use(helmet());
app.use(cors(corsOptions));

// Custom CORS logging middleware
app.use((req, res, next) => {
  console.log(`📨 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`   Origin: ${req.get('origin')}`);
  if (req.method === 'OPTIONS') {
    console.log(`   ✓ Preflight request handled`);
  }
  next();
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('✓ MySQL Database Connected Successfully');
    connection.release();
  })
  .catch(err => {
    console.error('✗ MySQL Connection Error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  console.warn(`⚠️  404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`❌ Error on ${req.method} ${req.path}:`, {
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
    requestId: req.id
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 FinanceFlow Backend Server running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation available at http://localhost:${PORT}/api/docs`);
  console.log(`✓ Server ready to accept requests\n`);
});

module.exports = app;
