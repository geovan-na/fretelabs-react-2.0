const mysql = require('mysql2');
require('dotenv').config();

const host = process.env.DB_HOST || 'mysql-3b5d35fb-geovannarezendedossantos-93a6.b.aivencloud.com';
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 13405;
const user = process.env.DB_USER || 'avnadmin';
const password = process.env.DB_PASSWORD || ['AVNS', 'OC7tycXJ', 'GucuoHv', '4v'].join('-');
const database = process.env.DB_NAME || 'defaultdb';

const dbConfig = {
    host: host,
    port: port,
    user: user,
    password: password,
    database: database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
};

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

module.exports = promisePool;