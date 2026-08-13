const mysql = require('mysql2');
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'fretelabs';

const dbConfig = {
    host: host,
    port: port,
    user: user,
    password: password,
    database: database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Configuração de SSL obrigatória para MySQL gerenciado em nuvem (Aiven)
const isCloud = process.env.DB_SSL === 'true' || 
                (host !== 'localhost' && host !== '127.0.0.1');

if (isCloud) {
    dbConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

module.exports = promisePool;