const { createPool } = require('mysql2/promise');
require('dotenv').config();

console.log('🔧 Database Configuration:');
console.log(`   Host: ${process.env.DB_HOST}`);
console.log(`   Port: ${process.env.DB_PORT}`);
console.log(`   User: ${process.env.DB_USER}`);
console.log(`   Database: ${process.env.DB_NAME}`);

const pool = createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// Add event listeners for pool
pool.on('connection', (connection) => {
  console.log('✓ New MySQL connection established');
});

pool.on('error', (err) => {
  console.error('❌ MySQL Pool Error:', {
    code: err.code,
    errno: err.errno,
    message: err.message,
    sqlState: err.sqlState
  });
});

// Test initial connection
pool.getConnection()
  .then(connection => {
    console.log('✓ Initial MySQL connection test: SUCCESS');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Initial MySQL connection test FAILED:', {
      code: err.code,
      errno: err.errno,
      message: err.message,
      sqlState: err.sqlState
    });
  });

module.exports = pool;
