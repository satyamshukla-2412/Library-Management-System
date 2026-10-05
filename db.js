// ============================================================
// MySQL Connection Pool (mysql2/promise)
// ============================================================
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'library_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(`[Database] Connected successfully to MySQL (${process.env.DB_NAME || 'library_db'}) on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
        connection.release();
        return true;
    } catch (err) {
        console.warn(`[Database Warning] Unable to connect to MySQL: ${err.message}`);
        console.warn(`[Database Hint] Verify your MySQL server is running and check your DB_PASSWORD in .env`);
        return false;
    }
}

module.exports = {
    pool,
    testConnection
};
