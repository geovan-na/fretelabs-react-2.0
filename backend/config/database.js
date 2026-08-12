const mysql = require('mysql2');
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 13405;

const dbConfig = {
    host: host,
    port: port,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Enable SSL for external cloud database connections (Aiven, etc.)
if (process.env.DB_SSL === 'true' || host !== 'localhost' || host.includes('aivencloud') || port !== 3306) {
    dbConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

module.exports = promisePool;