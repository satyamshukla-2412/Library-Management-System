// ============================================================
// College Library Management System - Express Backend Server
// Bridges Frontend Web UI <---> MySQL 8+ (library_db)
// ============================================================
// Prefer the project's .env values during local development. This prevents an
// empty inherited shell variable from overriding an updated DB_PASSWORD.
require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve the public IDs shown in the UI (for example STU2023001) to the
// matching member record. MySQL stores its own numeric member_id, while the
// front end uses an ID sequence for each member type.
async function findMemberForLogin(userId) {
    if (!userId) return null;
    const identifier = String(userId).trim();
    const memberSql = `
        SELECT m.member_id, m.name, m.email, m.phone, m.department, m.role, m.status,
               m.password, mt.type_id, mt.type_name, mt.max_books, mt.loan_days, mt.fine_per_day
          FROM member m
          JOIN member_type mt ON m.type_id = mt.type_id
    `;

    // 1. Direct match by numeric member_id, email, name, phone, or email prefix
    const [directMatches] = await pool.query(
        `${memberSql} WHERE CAST(m.member_id AS CHAR) = ? 
                          OR LOWER(m.email) = LOWER(?) 
                          OR LOWER(m.name) = LOWER(?)
                          OR m.phone = ?
                          OR LOWER(SUBSTRING_INDEX(m.email, '@', 1)) = LOWER(?)`,
        [identifier, identifier, identifier, identifier, identifier]
    );
    if (directMatches.length > 0) return directMatches[0];

    // 2. Friendly aliases for Librarian
    if (['librarian', 'admin', 'library'].includes(identifier.toLowerCase())) {
        const [librarians] = await pool.query(
            `${memberSql} WHERE mt.type_name = 'Librarian' AND m.status = 'ACTIVE' ORDER BY m.member_id ASC LIMIT 1`
        );
        if (librarians.length > 0) return librarians[0];
    }

    // 3. Match by formatted code, e.g. STU0000001, STU2023001, LIB001, EMP0000004
    const match = identifier.toUpperCase().match(/^(STU|TCH|NTS|EMP|LIB)(\d+)$/);
    if (match) {
        const prefix = match[1];
        const numPart = parseInt(match[2], 10);

        // Try direct member_id match first
        const [byId] = await pool.query(`${memberSql} WHERE m.member_id = ?`, [numPart]);
        if (byId.length > 0) return byId[0];

        // Try sequence/mock ID (like STU2023001 -> 1, LIB001 -> 1)
        const typeByPrefix = {
            STU: 'Student',
            TCH: 'Teacher',
            NTS: 'Non-Teaching Staff',
            EMP: 'Teacher',
            LIB: 'Librarian'
        };
        const targetType = typeByPrefix[prefix];
        if (targetType) {
            const seq = parseInt(match[2].slice(-3), 10);
            const [typeMembers] = await pool.query(
                `${memberSql} WHERE mt.type_name = ? ORDER BY m.member_id ASC`,
                [targetType]
            );
            if (seq >= 1 && seq <= typeMembers.length) {
                return typeMembers[seq - 1];
            }
        }
    }

    return null;
}

// Helper to resolve public/string/numeric Member ID to integer member_id
async function resolveNumericMemberId(input) {
    if (!input) return null;
    const str = String(input).trim();
    if (/^\d+$/.test(str)) return parseInt(str, 10);
    const user = await findMemberForLogin(str);
    return user ? user.member_id : null;
}

// Helper to resolve public/string/numeric Book ID to integer book_id
async function resolveNumericBookId(input) {
    if (!input) return null;
    const str = String(input).trim();
    if (/^\d+$/.test(str)) return parseInt(str, 10);
    const match = str.toUpperCase().match(/^LIB0*(\d+)$/);
    if (match) return parseInt(match[1], 10);
    const [rows] = await pool.query('SELECT book_id FROM book WHERE isbn = ? OR title = ? LIMIT 1', [str, str]);
    return rows.length > 0 ? rows[0].book_id : null;
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));
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
        const user = await findMemberForLogin(userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Member not found. Check your User ID / Email.' });
        }

        // Check password
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
        }

        // Check active status
        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ success: false, message: `Account is ${user.status.toLowerCase()}. Contact library administration.` });
        }

        // Optional user type verification
        if (userType && userType !== user.type_name) {
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

// 3. Public registration. Librarian accounts must be created by an administrator.
app.post('/api/signup', async (req, res) => {
    const { name, email, phone, department, userType, password } = req.body;
    const allowedTypes = ['Student', 'Teacher', 'Non-Teaching Staff', 'Librarian'];
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!String(name || '').trim() || !normalizedEmail || !String(password || '')) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }
    if (!allowedTypes.includes(userType)) {
        return res.status(400).json({ success: false, message: 'Select a valid member type.' });
    }
    if (String(password).length < 6) {
        return res.status(400).json({ success: false, message: 'Password must contain at least 6 characters.' });
    }

    try {
        const [types] = await pool.query('SELECT type_id FROM member_type WHERE type_name = ?', [userType]);
        const role = userType === 'Librarian' ? 'LIBRARIAN' : 'MEMBER';
        const [result] = await pool.query(
            `INSERT INTO member (name, email, phone, department, type_id, password, role)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [String(name).trim(), normalizedEmail, String(phone || '').trim() || null,
                String(department || '').trim() || null, types[0].type_id, password, role]
        );
        const memberId = result.insertId;
        const formattedId = userType === 'Librarian'
            ? `LIB${String(memberId).padStart(3, '0')}`
            : (userType === 'Student' ? `STU${String(memberId).padStart(7, '0')}` : `EMP${String(memberId).padStart(7, '0')}`);

        res.status(201).json({
            success: true,
            memberId: memberId,
            user_id: formattedId,
            name: String(name).trim(),
            email: normalizedEmail,
            userType: userType,
            message: `Account created successfully! Your Member ID is ${formattedId}. You can now log in using your email (${normalizedEmail}) or ID.`
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }
        console.error('[API Error] Sign-up failed:', err);
        res.status(500).json({ success: false, message: 'Unable to create the account. Please try again.' });
    }
});

// 4. Books: List all books with category names
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
        const mapped = rows.map(b => ({
            ...b,
            book_code: `LIB${String(b.book_id).padStart(3, '0')}`,
            formatted_id: `LIB${String(b.book_id).padStart(3, '0')}`
        }));
        res.json(mapped);
    } catch (err) {
        console.error('[API Error] Get books:', err);
        res.status(500).json({ error: err.message });
    }
});

// 4b. Live Search Books endpoint (by title, author, category, ISBN, shelf, publisher)
app.get('/api/books/search', async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();
        if (!q) {
            return res.json([]);
        }
        const cleanQ = q.replace(/[-\s]/g, '');
        const searchTerm = `%${q}%`;
        const sql = `
            SELECT b.book_id, b.title, b.author, b.publisher, b.isbn, b.edition,
                   b.shelf_number, b.is_reference, b.total_copies, b.available_copies,
                   b.category_id, c.category_name as category
              FROM book b
              JOIN category c ON b.category_id = c.category_id
             WHERE b.title LIKE ?
                OR b.author LIKE ?
                OR b.publisher LIKE ?
                OR b.isbn LIKE ?
                OR REPLACE(b.isbn, '-', '') LIKE ?
                OR c.category_name LIKE ?
                OR b.shelf_number LIKE ?
                OR CONCAT('LIB', LPAD(b.book_id, 3, '0')) LIKE ?
                OR CAST(b.book_id AS CHAR) = ?
             ORDER BY 
                CASE 
                    WHEN b.title LIKE ? THEN 1
                    WHEN b.author LIKE ? THEN 2
                    WHEN c.category_name LIKE ? THEN 3
                    ELSE 4
                END,
                b.title ASC
             LIMIT 12
        `;
        const [rows] = await pool.query(sql, [
            searchTerm, searchTerm, searchTerm, searchTerm, `%${cleanQ}%`,
            searchTerm, searchTerm, searchTerm, q,
            `${q}%`, `${q}%`, `${q}%`
        ]);
        const mapped = rows.map(b => ({
            ...b,
            book_code: `LIB${String(b.book_id).padStart(3, '0')}`,
            formatted_id: `LIB${String(b.book_id).padStart(3, '0')}`
        }));
        res.json(mapped);
    } catch (err) {
        console.error('[API Error] Search books:', err);
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
    try {
        const rawMemberId = req.params.memberId;
        const memberId = await resolveNumericMemberId(rawMemberId);
        if (!memberId) {
            return res.status(404).json({ error: 'Member not found' });
        }

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
        const numMemberId = await resolveNumericMemberId(memberId);
        const numBookId = await resolveNumericBookId(bookId);

        if (!numMemberId) {
            return res.status(400).json({ success: false, message: `Member not found: ${memberId}` });
        }
        if (!numBookId) {
            return res.status(400).json({ success: false, message: `Book not found: ${bookId}` });
        }

        const [result] = await pool.query('CALL sp_issue_book(?, ?)', [numMemberId, numBookId]);
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
        const numMemberId = await resolveNumericMemberId(memberId);
        const numBookId = await resolveNumericBookId(bookId);

        if (!numMemberId) {
            return res.status(400).json({ success: false, message: `Member not found: ${memberId}` });
        }
        if (!numBookId) {
            return res.status(400).json({ success: false, message: `Book not found: ${bookId}` });
        }

        const [result] = await pool.query('CALL sp_return_book(?, ?)', [numMemberId, numBookId]);
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
        const numMemberId = await resolveNumericMemberId(memberId);
        const numBookId = await resolveNumericBookId(bookId);

        if (!numMemberId) return res.status(400).json({ success: false, message: `Member not found: ${memberId}` });
        if (!numBookId) return res.status(400).json({ success: false, message: `Book not found: ${bookId}` });

        const [result] = await pool.query('CALL sp_renew_book(?, ?)', [numMemberId, numBookId]);
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
        const numMemberId = await resolveNumericMemberId(memberId);
        if (!numMemberId) return res.status(400).json({ success: false, message: `Member not found: ${memberId}` });
        await pool.query('CALL sp_pay_fine(?)', [numMemberId]);
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

// 12. Librarian: Per-member borrowing details.
app.get('/api/librarian/borrowing-details', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.member_id, m.name, m.email, m.department, mt.type_name,
                   COUNT(br.borrow_id) AS total_borrowed,
                   COALESCE(SUM(br.return_date IS NULL), 0) AS currently_borrowed,
                   COALESCE(SUM(br.return_date IS NOT NULL), 0) AS returned_books,
                   COALESCE(SUM(br.return_date IS NULL AND br.due_date < CURDATE()), 0) AS overdue_books,
                   COALESCE(SUM(CASE WHEN br.fine_paid = FALSE THEN br.fine_amount ELSE 0 END), 0) AS unpaid_fines
              FROM member m
              JOIN member_type mt ON mt.type_id = m.type_id
              LEFT JOIN borrows br ON br.member_id = m.member_id
             WHERE m.role <> 'LIBRARIAN'
             GROUP BY m.member_id, m.name, m.email, m.department, mt.type_name
             ORDER BY currently_borrowed DESC, total_borrowed DESC, m.name ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error('[API Error] Borrowing details:', err);
        res.status(500).json({ error: 'Unable to load borrowing details.' });
    }
});

// 13. Librarian: Currently issued books
app.get('/api/librarian/issued', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT br.borrow_id, br.member_id, m.name as member_name, mt.type_name as member_type,
                   m.department, bk.book_id, bk.title as book_title, bk.isbn,
                   CONCAT('LIB', LPAD(bk.book_id, 3, '0')) as book_code,
                   DATE_FORMAT(br.issue_date, '%Y-%m-%d') as issue_date,
                   DATE_FORMAT(br.due_date, '%Y-%m-%d') as due_date,
                   br.renew_count,
                   GREATEST(DATEDIFF(CURDATE(), br.due_date), 0) AS days_overdue,
                   IF(br.due_date < CURDATE(), 'Overdue', 'Issued') as status
              FROM borrows br
              JOIN member m ON br.member_id = m.member_id
              JOIN member_type mt ON m.type_id = mt.type_id
              JOIN book bk ON br.book_id = bk.book_id
             WHERE br.return_date IS NULL
             ORDER BY br.issue_date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 14. Librarian: Overdue books
app.get('/api/librarian/overdue', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT br.borrow_id, br.member_id, m.name as member_name, mt.type_name as member_type,
                   m.department, bk.book_id, bk.title as book_title, bk.isbn,
                   CONCAT('LIB', LPAD(bk.book_id, 3, '0')) as book_code,
                   DATE_FORMAT(br.issue_date, '%Y-%m-%d') as issue_date,
                   DATE_FORMAT(br.due_date, '%Y-%m-%d') as due_date,
                   DATEDIFF(CURDATE(), br.due_date) AS days_overdue,
                   (DATEDIFF(CURDATE(), br.due_date) * mt.fine_per_day) AS fine_accrued,
                   'Overdue' as status
              FROM borrows br
              JOIN member m ON br.member_id = m.member_id
              JOIN member_type mt ON m.type_id = mt.type_id
              JOIN book bk ON br.book_id = bk.book_id
             WHERE br.return_date IS NULL AND br.due_date < CURDATE()
             ORDER BY days_overdue DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 15. Librarian: All transactions
app.get('/api/librarian/transactions', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT br.borrow_id, br.member_id, m.name as member_name, mt.type_name as member_type,
                   bk.book_id, bk.title as book_title,
                   CONCAT('LIB', LPAD(bk.book_id, 3, '0')) as book_code,
                   DATE_FORMAT(br.issue_date, '%Y-%m-%d') as issue_date,
                   DATE_FORMAT(br.due_date, '%Y-%m-%d') as due_date,
                   DATE_FORMAT(br.return_date, '%Y-%m-%d') as return_date,
                   br.renew_count, br.fine_amount, br.fine_paid,
                   CASE
                       WHEN br.return_date IS NOT NULL THEN 'Returned'
                       WHEN br.due_date < CURDATE() THEN 'Overdue'
                       ELSE 'Issued'
                   END as status
              FROM borrows br
              JOIN member m ON br.member_id = m.member_id
              JOIN member_type mt ON m.type_id = mt.type_id
              JOIN book bk ON br.book_id = bk.book_id
             ORDER BY br.borrow_id DESC
        `);
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
    const publicIndex = path.join(__dirname, 'public', 'index.html');
    if (require('fs').existsSync(publicIndex)) {
        res.sendFile(publicIndex);
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Start Server locally
if (require.main === module || (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME)) {
    app.listen(PORT, async () => {
        console.log(`====================================================`);
        console.log(`🚀 College Library Portal running at: http://localhost:${PORT}`);
        console.log(`====================================================`);
        await testConnection();
    });
}

module.exports = app;
