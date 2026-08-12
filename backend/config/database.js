const mysql = require('mysql2');
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '3307', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'fretelabs';

console.log(`🔌 [Database] Connecting to MySQL Host: ${host}:${port} | Database: ${database}`);

const dbConfig = {
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Enable SSL if connecting to cloud database providers (like Aiven)
if (process.env.DB_SSL === 'true' || host.includes('aivencloud.com') || host.includes('cloud')) {
    dbConfig.ssl = { rejectUnauthorized: false };
    console.log('🔒 [Database] SSL enabled for cloud connection.');
}

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

module.exports = promisePool;