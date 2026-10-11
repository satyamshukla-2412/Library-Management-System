// ============================================================
// Database Seeder - Seeds all sample data into MySQL (library_db)
// Preserves existing records while populating the full catalog.
// ============================================================
require('dotenv').config({ override: true });
const { pool } = require('../db');

async function seed() {
    console.log('[Seed] Starting database population...');

    // 1. Ensure categories
    const categories = [
        [1, 'Computer Science'],
        [2, 'Mathematics'],
        [3, 'Electronics'],
        [4, 'Civil Engineering'],
        [5, 'Mechanical Engineering'],
        [6, 'Literature'],
        [7, 'Physics'],
        [8, 'Chemistry'],
        [9, 'General Engineering']
    ];

    for (const [id, name] of categories) {
        await pool.query(
            `INSERT INTO category (category_id, category_name) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE category_name = VALUES(category_name)`,
            [id, name]
        );
    }
    console.log('[Seed] Categories verified (9 categories).');

    // 2. Sample Books
    const books = [
        { title: 'Database System Concepts', author: 'Silberschatz, Korth', publisher: 'McGraw-Hill', isbn: '978-0078022159', edition: '7th Edition', shelf: 'CS-A1', is_ref: 0, total: 5, avail: 4, cat: 1 },
        { title: 'Operating System Concepts', author: 'Galvin, Gagne', publisher: 'Wiley', isbn: '978-1118063330', edition: '10th Edition', shelf: 'CS-A2', is_ref: 0, total: 4, avail: 3, cat: 1 },
        { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', publisher: 'Pearson', isbn: '978-9332518742', edition: '5th Edition', shelf: 'CS-B1', is_ref: 0, total: 4, avail: 3, cat: 1 },
        { title: 'Introduction to Algorithms', author: 'CLRS', publisher: 'MIT Press', isbn: '978-0262033848', edition: '3rd Edition', shelf: 'CS-C1', is_ref: 0, total: 3, avail: 2, cat: 1 },
        { title: 'Higher Engineering Mathematics', author: 'B.S. Grewal', publisher: 'Khanna', isbn: '978-8174091956', edition: '44th Edition', shelf: 'MA-A1', is_ref: 0, total: 6, avail: 5, cat: 2 },
        { title: 'Digital Electronics', author: 'Morris Mano', publisher: 'Pearson', isbn: '978-9332542525', edition: '5th Edition', shelf: 'EC-A1', is_ref: 0, total: 4, avail: 4, cat: 3 },
        { title: 'Basic Electrical Engineering', author: 'D.P. Kothari', publisher: 'McGraw-Hill', isbn: '978-9352605736', edition: '4th Edition', shelf: 'EE-A1', is_ref: 0, total: 3, avail: 3, cat: 3 },
        { title: 'Mechanics of Materials', author: 'R.C. Hibbeler', publisher: 'Pearson', isbn: '978-0134319650', edition: '10th Edition', shelf: 'ME-A1', is_ref: 0, total: 3, avail: 3, cat: 5 },
        { title: 'Theory of Machines', author: 'S.S. Rattan', publisher: 'McGraw-Hill', isbn: '978-9351343479', edition: '4th Edition', shelf: 'ME-B1', is_ref: 0, total: 3, avail: 3, cat: 5 },
        { title: 'Surveying Volume 1', author: 'B.C. Punmia', publisher: 'Laxmi Pub', isbn: '978-8170088530', edition: '16th Edition', shelf: 'CE-A1', is_ref: 0, total: 3, avail: 3, cat: 4 },
        { title: 'Engineering Physics', author: 'H.K. Malik', publisher: 'McGraw-Hill', isbn: '978-0070671539', edition: '2nd Edition', shelf: 'PH-A1', is_ref: 0, total: 3, avail: 3, cat: 7 },
        { title: 'Engineering Chemistry', author: 'Jain & Jain', publisher: 'Dhanpat Rai', isbn: '978-8177582093', edition: '16th Edition', shelf: 'CH-A1', is_ref: 0, total: 4, avail: 4, cat: 8 },
        { title: 'Encyclopedia of Computing', author: 'Various Authors', publisher: 'Oxford', isbn: '978-0198609612', edition: '1st Edition', shelf: 'REF-01', is_ref: 1, total: 1, avail: 1, cat: 1 },
        { title: 'Oxford Advanced Learner Dictionary', author: 'A.S. Hornby', publisher: 'Oxford', isbn: '978-0194799003', edition: '9th Edition', shelf: 'REF-02', is_ref: 1, total: 2, avail: 2, cat: 6 },
        { title: 'Data Structures Using C', author: 'Reema Thareja', publisher: 'Oxford University Press', isbn: '978-0198099307', edition: '2nd Edition', shelf: 'CS-A3', is_ref: 0, total: 5, avail: 5, cat: 1 },
        { title: 'Linear Algebra and Its Applications', author: 'Gilbert Strang', publisher: 'Cengage Learning', isbn: '978-8131501726', edition: '4th Edition', shelf: 'MA-A2', is_ref: 0, total: 3, avail: 3, cat: 2 },
        { title: 'Let Us C', author: 'Yashavant Kanetkar', publisher: 'BPB Publications', isbn: '978-8183331630', edition: '17th Edition', shelf: 'CS-A4', is_ref: 0, total: 6, avail: 6, cat: 1 },
        { title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum', publisher: 'Pearson Education', isbn: '978-9332550575', edition: '4th Edition', shelf: 'CS-C1', is_ref: 0, total: 3, avail: 3, cat: 1 },
        { title: 'Software Engineering', author: 'Ian Sommerville', publisher: 'Pearson Education', isbn: '978-9332518858', edition: '10th Edition', shelf: 'CS-C2', is_ref: 0, total: 4, avail: 4, cat: 1 },
        { title: 'Discrete Mathematics and Its Applications', author: 'Kenneth H. Rosen', publisher: 'McGraw-Hill Education', isbn: '978-0070681880', edition: '7th Edition', shelf: 'MA-B2', is_ref: 0, total: 4, avail: 4, cat: 2 },
        { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', publisher: 'Pearson Education', isbn: '978-9332543515', edition: '3rd Edition', shelf: 'CS-D2', is_ref: 0, total: 3, avail: 3, cat: 1 },
        { title: 'Microprocessor Architecture, Programming, and Applications', author: 'Ramesh S. Gaonkar', publisher: 'Penram International', isbn: '978-8131705988', edition: '5th Edition', shelf: 'EC-B1', is_ref: 0, total: 4, avail: 4, cat: 3 },
        { title: 'Fluid Mechanics', author: 'R.K. Bansal', publisher: 'Laxmi Publications', isbn: '978-8131808153', edition: '9th Edition', shelf: 'ME-A2', is_ref: 0, total: 3, avail: 3, cat: 5 },
        { title: 'Strength of Materials', author: 'R.K. Rajput', publisher: 'S. Chand Publishing', isbn: '978-8121935029', edition: '6th Edition', shelf: 'CE-A2', is_ref: 0, total: 4, avail: 4, cat: 4 },
        { title: 'Engineering Drawing', author: 'N.D. Bhatt', publisher: 'Charotar Publishing', isbn: '978-9380358178', edition: '53rd Edition', shelf: 'GE-A1', is_ref: 0, total: 6, avail: 6, cat: 9 },
        { title: 'Probability and Statistics for Engineers', author: 'Ronald E. Walpole', publisher: 'Pearson Education', isbn: '978-9332519091', edition: '9th Edition', shelf: 'MA-C1', is_ref: 0, total: 3, avail: 3, cat: 2 }
    ];

    for (const b of books) {
        await pool.query(
            `INSERT INTO book (title, author, publisher, isbn, edition, shelf_number, is_reference, total_copies, available_copies, category_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                author = VALUES(author),
                publisher = VALUES(publisher),
                edition = VALUES(edition),
                shelf_number = VALUES(shelf_number),
                is_reference = VALUES(is_reference),
                category_id = VALUES(category_id)`,
            [b.title, b.author, b.publisher, b.isbn, b.edition, b.shelf, b.is_ref, b.total, b.avail, b.cat]
        );
    }
    console.log(`[Seed] Books catalog seeded (${books.length} books total).`);

    // 3. Sample Members
    const members = [
        { name: 'Rahul Sharma', email: 'rahul.sharma@college.edu.in', phone: '9876543210', dept: 'Computer Science', type_id: 1, pass: 'rahul123', role: 'MEMBER' },
        { name: 'Priya Patel', email: 'priya.patel@college.edu.in', phone: '9876543211', dept: 'Electronics', type_id: 1, pass: 'priya123', role: 'MEMBER' },
        { name: 'Amit Kumar', email: 'amit.kumar@college.edu.in', phone: '9876543212', dept: 'Mechanical Engineering', type_id: 1, pass: 'amit123', role: 'MEMBER' },
        { name: 'Anita Joshi', email: 'anita.joshi@college.edu.in', phone: '9876543213', dept: 'Mechanical Engineering', type_id: 1, pass: 'anita123', role: 'MEMBER' },
        { name: 'Dr. Suresh Iyer', email: 'suresh.iyer@college.edu.in', phone: '9876543220', dept: 'Computer Science', type_id: 2, pass: 'suresh123', role: 'MEMBER' },
        { name: 'Prof. Meena Desai', email: 'meena.desai@college.edu.in', phone: '9876543221', dept: 'Mathematics', type_id: 2, pass: 'meena123', role: 'MEMBER' },
        { name: 'Dr. Rajesh Nair', email: 'rajesh.nair@college.edu.in', phone: '9876543222', dept: 'Physics', type_id: 2, pass: 'rajesh123', role: 'MEMBER' },
        { name: 'Sunita Rao', email: 'sunita.rao@college.edu.in', phone: '9876543230', dept: 'Administration', type_id: 3, pass: 'sunita123', role: 'MEMBER' },
        { name: 'Ramesh Gupta', email: 'ramesh.gupta@college.edu.in', phone: '9876543231', dept: 'Library Support', type_id: 3, pass: 'ramesh123', role: 'MEMBER' },
        { name: 'Mr. Vikram Singh', email: 'vikram.singh@college.edu.in', phone: '9876543200', dept: 'Central Library', type_id: 4, pass: 'admin123', role: 'LIBRARIAN' }
    ];

    for (const m of members) {
        await pool.query(
            `INSERT INTO member (name, email, phone, department, type_id, password, role)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                phone = VALUES(phone),
                department = VALUES(department),
                type_id = VALUES(type_id),
                role = VALUES(role)`,
            [m.name, m.email, m.phone, m.dept, m.type_id, m.pass, m.role]
        );
    }
    console.log('[Seed] Members catalog verified.');

    // 4. Update available_copies for books based on active borrows
    await pool.query(`
        UPDATE book b
        SET available_copies = total_copies - (
            SELECT COUNT(*) FROM borrows br
            WHERE br.book_id = b.book_id AND br.return_date IS NULL
        )
        WHERE b.book_id > 0
    `);
    console.log('[Seed] Book inventory updated based on active loans.');

    console.log('[Seed] Database successfully synchronized with all sample data!');
    process.exit(0);
}

seed().catch(err => {
    console.error('[Seed Error]:', err);
    process.exit(1);
});
