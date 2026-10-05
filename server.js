// ============================================================
// College Library Management System - Express Backend Server
// Bridges Frontend Web UI <---> MySQL 8+ (library_db)
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(__dirname));

// ============================================================
// API ROUTES
// ============================================================

// 1. Health / Database status check
app.get('/api/status', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 as test');
        res.json({
            connected: true,
            database: process.env.DB_NAME || 'library_db',
            host: process.env.DB_HOST || 'localhost'
        });
    } catch (err) {
        res.status(503).json({
            connected: false,
            error: err.message,
            hint: 'Verify MySQL server is running and check DB_PASSWORD in .env'
        });
    }
});

// 2. Authentication: Login
app.post('/api/login', async (req, res) => {
    const { userId, password, userType } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ success: false, message: 'User ID and password are required.' });
    }

    try {
        // Query member by ID or Email
        const sql = `
            SELECT m.member_id, m.name, m.email, m.phone, m.department, m.role, m.status,
                   m.password, mt.type_id, mt.type_name, mt.max_books, mt.loan_days, mt.fine_per_day
              FROM member m
              JOIN member_type mt ON m.type_id = mt.type_id
             WHERE (m.member_id = ? OR m.email = ?)
        `;
        const [rows] = await pool.query(sql, [userId, userId]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Member not found. Check your User ID / Email.' });
        }

        const user = rows[0];

        // Check password
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
        }

        // Check active status
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ success: false, message: `Account is ${user.status.toLowerCase()}. Contact library administration.` });
        }

        // Optional user type verification
        if (userType && userType !== user.type_name && user.role !== 'LIBRARIAN') {
            return res.status(401).json({ success: false, message: `Account is registered as ${user.type_name}, not ${userType}.` });
        }

        res.json({
            success: true,
            user: {
                member_id: user.member_id,
                user_id: user.type_name === 'Librarian' ? `LIB${String(user.member_id).padStart(3, '0')}` : (user.type_name === 'Student' ? `STU${String(user.member_id).padStart(7, '0')}` : `EMP${String(user.member_id).padStart(7, '0')}`),
                name: user.name,
                email: user.email,
                phone: user.phone || '—',
                department: user.department || 'General',
                user_type: user.type_name,
                role: user.role
            }
        });
    } catch (err) {
        console.error('[API Error] Login failed:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Books: List all books with category names
app.get('/api/books', async (req, res) => {
    try {
        const sql = `
            SELECT b.book_id, b.title, b.author, b.publisher, b.isbn, b.edition,
                   b.shelf_number, b.is_reference, b.total_copies, b.available_copies,
                   b.category_id, c.category_name as category
              FROM book b
              JOIN category c ON b.category_id = c.category_id
             ORDER BY b.book_id ASC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (err) {
        console.error('[API Error] Get books:', err);
        res.status(500).json({ error: err.message });
    }
});

// 4. Categories
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT category_id, category_name FROM category ORDER BY category_name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Library Rules (member_type table)
app.get('/api/rules', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM member_type ORDER BY type_id ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. User Account Details & Loans
app.get('/api/my-account/:memberId', async (req, res) => {
    const memberId = parseInt(req.params.memberId, 10);
    try {
        // Member info
        const [members] = await pool.query(
            `SELECT m.member_id, m.name, m.email, m.phone, m.department, m.role, mt.type_name, mt.max_books, mt.loan_days, mt.fine_per_day
               FROM member m
               JOIN member_type mt ON m.type_id = mt.type_id
              WHERE m.member_id = ?`,
            [memberId]
        );

        if (members.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const member = members[0];

        // Active Loans
        const [activeLoans] = await pool.query(
            `SELECT b.borrow_id, b.member_id, b.book_id, b.issue_date, b.due_date, b.renew_count,
                    bk.title, bk.author, bk.isbn, bk.shelf_number,
                    GREATEST(DATEDIFF(CURDATE(), b.due_date), 0) AS days_overdue,
                    (GREATEST(DATEDIFF(CURDATE(), b.due_date), 0) * mt.fine_per_day) AS current_fine,
                    IF(b.due_date < CURDATE(), 'Overdue', 'Issued') as status
               FROM borrows b
               JOIN book bk ON b.book_id = bk.book_id
               JOIN member m ON b.member_id = m.member_id
               JOIN member_type mt ON m.type_id = mt.type_id
              WHERE b.member_id = ? AND b.return_date IS NULL
              ORDER BY b.due_date ASC`,
            [memberId]
        );

        // Historical Returned Loans
        const [history] = await pool.query(
            `SELECT b.borrow_id, b.member_id, b.book_id, b.issue_date, b.due_date, b.return_date,
                    b.fine_amount, b.fine_paid, bk.title, bk.author, bk.isbn, 'Returned' as status
               FROM borrows b
               JOIN book bk ON b.book_id = bk.book_id
              WHERE b.member_id = ? AND b.return_date IS NOT NULL
              ORDER BY b.return_date DESC`,
            [memberId]
        );

        res.json({
            member,
            activeLoans,
            history
        });
    } catch (err) {
        console.error('[API Error] my-account:', err);
        res.status(500).json({ error: err.message });
    }
});

// 7. Borrow Book (Calls Stored Procedure: sp_issue_book)
app.post('/api/borrow', async (req, res) => {
    const { memberId, bookId } = req.body;
    if (!memberId || !bookId) {
        return res.status(400).json({ success: false, message: 'memberId and bookId are required' });
    }

    try {
        const [result] = await pool.query('CALL sp_issue_book(?, ?)', [memberId, bookId]);
        // result[0][0] contains procedure output columns
        const output = (result && result[0] && result[0][0]) || {};
        res.json({
            success: true,
            message: output.status_message || output.message || 'Book issued successfully',
            dueDate: output.due_date,
            borrowId: output.borrow_id
        });
    } catch (err) {
        console.warn('[Stored Procedure] Issue Book error:', err.message);
        res.status(400).json({
            success: false,
            message: err.sqlMessage || err.message
        });
    }
});

// 8. Return Book (Calls Stored Procedure: sp_return_book)
app.post('/api/return', async (req, res) => {
    const { memberId, bookId } = req.body;
    if (!memberId || !bookId) {
        return res.status(400).json({ success: false, message: 'memberId and bookId are required' });
    }

    try {
        const [result] = await pool.query('CALL sp_return_book(?, ?)', [memberId, bookId]);
        const output = (result && result[0] && result[0][0]) || {};
        res.json({
            success: true,
            message: output.status_message || output.message || 'Book returned successfully',
            daysOverdue: output.days_overdue || output.days_late || 0,
            fine: output.calculated_fine || output.fine || 0
        });
    } catch (err) {
        console.warn('[Stored Procedure] Return Book error:', err.message);
        res.status(400).json({
            success: false,
            message: err.sqlMessage || err.message
        });
    }
});

// 9. Renew Book (Calls Stored Procedure: sp_renew_book)
app.post('/api/renew', async (req, res) => {
    const { memberId, bookId } = req.body;
    try {
        const [result] = await pool.query('CALL sp_renew_book(?, ?)', [memberId, bookId]);
        const output = (result && result[0] && result[0][0]) || {};
        res.json({
            success: true,
            message: output.status_message || output.message || 'Book renewed successfully',
            newDueDate: output.new_due_date
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.sqlMessage || err.message
        });
    }
});

// 10. Pay Fine (Calls Stored Procedure: sp_pay_fine)
app.post('/api/pay-fine', async (req, res) => {
    const { memberId } = req.body;
    try {
        await pool.query('CALL sp_pay_fine(?)', [memberId]);
        res.json({ success: true, message: 'Fines cleared successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.sqlMessage || err.message });
    }
});

// 11. Librarian: Get all members
app.get('/api/librarian/members', async (req, res) => {
    try {
        const sql = `
            SELECT m.member_id, m.name, m.email, m.phone, m.department, m.role, m.status, mt.type_name,
                   (SELECT COUNT(*) FROM borrows WHERE member_id = m.member_id AND return_date IS NULL) as active_loans
              FROM member m
              JOIN member_type mt ON m.type_id = mt.type_id
             ORDER BY m.member_id ASC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 12. Librarian: Add new book
app.post('/api/librarian/books', async (req, res) => {
    const { title, author, publisher, isbn, edition, shelf_number, is_reference, total_copies, category_id } = req.body;
    try {
        const copies = parseInt(total_copies, 10) || 1;
        const sql = `
            INSERT INTO book (title, author, publisher, isbn, edition, shelf_number, is_reference, total_copies, available_copies, category_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(sql, [
            title, author, publisher || '', isbn, edition || '1st Edition',
            shelf_number || 'General', is_reference ? 1 : 0, copies, copies, category_id || 1
        ]);
        res.json({ success: true, book_id: result.insertId, message: 'Book created successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.sqlMessage || err.message });
    }
});

// 13. Librarian: Update book
app.put('/api/librarian/books/:id', async (req, res) => {
    const bookId = parseInt(req.params.id, 10);
    const { title, author, publisher, isbn, edition, shelf_number, total_copies, available_copies } = req.body;
    try {
        const sql = `
            UPDATE book
               SET title = ?, author = ?, publisher = ?, isbn = ?, edition = ?, shelf_number = ?,
                   total_copies = ?, available_copies = ?
             WHERE book_id = ?
        `;
        await pool.query(sql, [title, author, publisher, isbn, edition, shelf_number, total_copies, available_copies, bookId]);
        res.json({ success: true, message: 'Book updated successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.sqlMessage || err.message });
    }
});

// 14. Librarian: Delete book
app.delete('/api/librarian/books/:id', async (req, res) => {
    const bookId = parseInt(req.params.id, 10);
    try {
        // Check active borrows
        const [borrows] = await pool.query('SELECT COUNT(*) as count FROM borrows WHERE book_id = ? AND return_date IS NULL', [bookId]);
        if (borrows[0].count > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete book: copies are currently borrowed' });
        }
        await pool.query('DELETE FROM book WHERE book_id = ?', [bookId]);
        res.json({ success: true, message: 'Book deleted successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.sqlMessage || err.message });
    }
});

// 15. Librarian: Add member
app.post('/api/librarian/members', async (req, res) => {
    const { name, email, phone, department, type_id, password } = req.body;
    try {
        const sql = `
            INSERT INTO member (name, email, phone, department, type_id, password, role)
            VALUES (?, ?, ?, ?, ?, ?, 'MEMBER')
        `;
        const [result] = await pool.query(sql, [name, email, phone || '', department || '', type_id || 1, password || 'password123']);
        res.json({ success: true, member_id: result.insertId, message: 'Member registered successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.sqlMessage || err.message });
    }
});

// 16. Librarian: Reports & Stats
app.get('/api/librarian/reports', async (req, res) => {
    try {
        const [counts] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM book) as unique_titles,
                (SELECT COALESCE(SUM(total_copies), 0) FROM book) as total_copies,
                (SELECT COALESCE(SUM(available_copies), 0) FROM book) as available_copies,
                (SELECT COUNT(*) FROM borrows WHERE return_date IS NULL) as currently_issued,
                (SELECT COUNT(*) FROM borrows WHERE return_date IS NULL AND due_date < CURDATE()) as overdue_count,
                (SELECT COUNT(*) FROM member WHERE role != 'LIBRARIAN') as total_members,
                (SELECT COUNT(*) FROM borrows) as total_transactions,
                (SELECT COALESCE(SUM(fine_amount), 0) FROM borrows) as total_fines
        `);

        // Category breakdown
        const [categories] = await pool.query(`
            SELECT c.category_name, COUNT(b.book_id) as book_count,
                   COALESCE(SUM(b.total_copies), 0) as total_copies,
                   COALESCE(SUM(b.available_copies), 0) as available_copies
              FROM category c
              LEFT JOIN book b ON c.category_id = b.category_id
             GROUP BY c.category_id, c.category_name
        `);

        // Member type breakdown
        const [memberTypes] = await pool.query(`
            SELECT mt.type_name, COUNT(m.member_id) as member_count
              FROM member_type mt
              LEFT JOIN member m ON mt.type_id = m.type_id
             WHERE mt.type_name != 'Librarian'
             GROUP BY mt.type_id, mt.type_name
        `);

        res.json({
            summary: counts[0],
            categories,
            memberTypes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fallback for root /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, async () => {
    console.log(`====================================================`);
    console.log(`🚀 College Library Portal running at: http://localhost:${PORT}`);
    console.log(`====================================================`);
    await testConnection();
});
