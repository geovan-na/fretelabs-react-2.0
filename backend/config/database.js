const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Enable SSL if connecting to cloud database providers (like Aiven)
if (process.env.DB_SSL === 'true' || (process.env.DB_HOST && (process.env.DB_HOST.includes('aivencloud.com') || process.env.DB_HOST.includes('cloud')))) {
    dbConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

module.exports = promisePool;