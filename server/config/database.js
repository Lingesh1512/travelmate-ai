const mysql2 = require('mysql2');
require('dotenv').config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'travelmate_ai',
  port: Number(process.env.DB_PORT) || 3306,

  // TiDB Cloud Starter requires TLS
  ssl: process.env.TIDB_ENABLE_SSL === 'true'
    ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

const promisePool = pool.promise();

const testConnection = async () => {
  try {
    await promisePool.query('SELECT 1');

    console.log('✅ MySQL/TiDB database connected successfully');

    return true;
  } catch (error) {
    console.error('❌ MySQL/TiDB connection failed:', error.message);

    return false;
  }
};

module.exports = {
  pool: promisePool,
  testConnection
};