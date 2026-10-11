// ============================================================
// College Library Management System - Mock Database
// This file simulates the database tables that will later
// be implemented in a relational DBMS (MySQL / PostgreSQL).
// ============================================================

// --- Departments Table ---
let departments = [
    { department_id: "DEPT01", department_name: "Computer Engineering" },
    { department_id: "DEPT02", department_name: "Information Technology" },
    { department_id: "DEPT03", department_name: "Electronics & Telecom" },
    { department_id: "DEPT04", department_name: "Mechanical Engineering" },
    { department_id: "DEPT05", department_name: "Civil Engineering" },
    { department_id: "DEPT06", department_name: "Mathematics" },
    { department_id: "DEPT07", department_name: "Physics" },
    { department_id: "DEPT08", department_name: "Chemistry" },
    { department_id: "DEPT09", department_name: "Administration" }
];

// --- Library Rules Table ---
// These rules define borrowing limits per user type.
// In production, these come from the database and can be updated by the librarian.
let libraryRules = [
    {
        rule_id: "RULE01",
        user_type: "Student",
        maximum_books: 3,
        borrowing_days: 14,
        renewal_limit: 1,
        fine_per_day: 2  // in ₹
    },
    {
        rule_id: "RULE02",
        user_type: "Teacher",
        maximum_books: 8,
        borrowing_days: 30,
        renewal_limit: 2,
        fine_per_day: 1
    },
    {
        rule_id: "RULE03",
        user_type: "Non-Teaching Staff",
        maximum_books: 4,
        borrowing_days: 21,
        renewal_limit: 1,
        fine_per_day: 2
    }
];

// --- Users Table ---
let users = [
    {
        user_id: "STU2023001",
        name: "Rahul Sharma",
        email: "rahul.sharma@college.edu.in",
        phone: "9876543210",
        department: "Computer Engineering",
        user_type: "Student",
        password: "rahul123"
    },
    {
        user_id: "STU2023002",
        name: "Priya Patel",
        email: "priya.patel@college.edu.in",
        phone: "9876543211",
        department: "Information Technology",
        user_type: "Student",
        password: "priya123"
    },
    {
        user_id: "STU2023003",
        name: "Amit Kumar",
        email: "amit.kumar@college.edu.in",
        phone: "9876543212",
        department: "Electronics & Telecom",
        user_type: "Student",
        password: "amit123"
    },
    {
        user_id: "STU2023004",
        name: "Anita Joshi",
        email: "anita.joshi@college.edu.in",
        phone: "9876543213",
        department: "Mechanical Engineering",
        user_type: "Student",
        password: "anita123"
    },
    {
        user_id: "TCH2023001",
        name: "Dr. Suresh Iyer",
        email: "suresh.iyer@college.edu.in",
        phone: "9876543220",
        department: "Computer Engineering",
        user_type: "Teacher",
        password: "suresh123"
    },
    {
        user_id: "TCH2023002",
        name: "Prof. Meena Desai",
        email: "meena.desai@college.edu.in",
        phone: "9876543221",
        department: "Mathematics",
        user_type: "Teacher",
        password: "meena123"
    },
    {
        user_id: "TCH2023003",
        name: "Dr. Rajesh Nair",
        email: "rajesh.nair@college.edu.in",
        phone: "9876543222",
        department: "Physics",
        user_type: "Teacher",
        password: "rajesh123"
    },
    {
        user_id: "NTS2023001",
        name: "Sunita Verma",
        email: "sunita.verma@college.edu.in",
        phone: "9876543230",
        department: "Administration",
        user_type: "Non-Teaching Staff",
        password: "sunita123"
    },
    {
        user_id: "NTS2023002",
        name: "Ramesh Gupta",
        email: "ramesh.gupta@college.edu.in",
        phone: "9876543231",
        department: "Administration",
        user_type: "Non-Teaching Staff",
        password: "ramesh123"
    },
    {
        user_id: "LIB001",
        name: "Mr. Vikram Singh",
        email: "vikram.singh@college.edu.in",
        phone: "9876543200",
        department: "Library",
        user_type: "Librarian",
        password: "admin123"
    }
];

// --- Books Table ---
let books = [
    {
        book_id: "LIB001",
        title: "Database Management Systems",
        author: "Abraham Silberschatz, Henry Korth",
        isbn: "978-0078022159",
        publisher: "McGraw-Hill Education",
        category: "Computer Science",
        edition: "7th Edition",
        total_copies: 5,
        available_copies: 3,
        shelf_number: "CS-A1"
    },
    {
        book_id: "LIB002",
        title: "Operating System Concepts",
        author: "Abraham Silberschatz, Peter Galvin",
        isbn: "978-1118063330",
        publisher: "Wiley",
        category: "Computer Science",
        edition: "10th Edition",
        total_copies: 4,
        available_copies: 0,
        shelf_number: "CS-A2"
    },
    {
        book_id: "LIB003",
        title: "Higher Engineering Mathematics",
        author: "B.S. Grewal",
        isbn: "978-8174091956",
        publisher: "Khanna Publishers",
        category: "Mathematics",
        edition: "44th Edition",
        total_copies: 6,
        available_copies: 2,
        shelf_number: "MA-B1"
    },
    {
        book_id: "LIB004",
        title: "Data Structures Using C",
        author: "Reema Thareja",
        isbn: "978-0198099307",
        publisher: "Oxford University Press",
        category: "Computer Science",
        edition: "2nd Edition",
        total_copies: 5,
        available_copies: 4,
        shelf_number: "CS-A3"
    },
    {
        book_id: "LIB005",
        title: "Computer Networks",
        author: "Andrew S. Tanenbaum",
        isbn: "978-9332518742",
        publisher: "Pearson Education",
        category: "Computer Science",
        edition: "5th Edition",
        total_copies: 4,
        available_copies: 1,
        shelf_number: "CS-B1"
    },
    {
        book_id: "LIB006",
        title: "Digital Logic and Computer Design",
        author: "M. Morris Mano",
        isbn: "978-8131714508",
        publisher: "Pearson Education",
        category: "Electronics",
        edition: "4th Edition",
        total_copies: 3,
        available_copies: 2,
        shelf_number: "EC-A1"
    },
    {
        book_id: "LIB007",
        title: "Introduction to the Theory of Computation",
        author: "Michael Sipser",
        isbn: "978-8131525296",
        publisher: "Cengage Learning",
        category: "Computer Science",
        edition: "3rd Edition",
        total_copies: 3,
        available_copies: 3,
        shelf_number: "CS-B2"
    },
    {
        book_id: "LIB008",
        title: "Software Engineering: A Practitioner's Approach",
        author: "Roger S. Pressman",
        isbn: "978-0078022128",
        publisher: "McGraw-Hill Education",
        category: "Computer Science",
        edition: "8th Edition",
        total_copies: 4,
        available_copies: 2,
        shelf_number: "CS-C1"
    },
    {
        book_id: "LIB009",
        title: "Compilers: Principles, Techniques, and Tools",
        author: "Alfred V. Aho, Jeffrey D. Ullman",
        isbn: "978-9332518667",
        publisher: "Pearson Education",
        category: "Computer Science",
        edition: "2nd Edition",
        total_copies: 3,
        available_copies: 1,
        shelf_number: "CS-C2"
    },
    {
        book_id: "LIB010",
        title: "Discrete Mathematics and Its Applications",
        author: "Kenneth H. Rosen",
        isbn: "978-0073383095",
        publisher: "McGraw-Hill Education",
        category: "Mathematics",
        edition: "7th Edition",
        total_copies: 5,
        available_copies: 3,
        shelf_number: "MA-B2"
    },
    {
        book_id: "LIB011",
        title: "Signals and Systems",
        author: "Alan V. Oppenheim",
        isbn: "978-9332550230",
        publisher: "Pearson Education",
        category: "Electronics",
        edition: "2nd Edition",
        total_copies: 3,
        available_copies: 2,
        shelf_number: "EC-A2"
    },
    {
        book_id: "LIB012",
        title: "Engineering Physics",
        author: "R.K. Gaur, S.L. Gupta",
        isbn: "978-8177091809",
        publisher: "Dhanpat Rai Publications",
        category: "Physics",
        edition: "8th Edition",
        total_copies: 4,
        available_copies: 4,
        shelf_number: "PH-A1"
    },
    {
        book_id: "LIB013",
        title: "Machine Learning",
        author: "Tom M. Mitchell",
        isbn: "978-1259096952",
        publisher: "McGraw-Hill Education",
        category: "Computer Science",
        edition: "1st Edition",
        total_copies: 3,
        available_copies: 0,
        shelf_number: "CS-D1"
    },
    {
        book_id: "LIB014",
        title: "Artificial Intelligence: A Modern Approach",
        author: "Stuart Russell, Peter Norvig",
        isbn: "978-9332543515",
        publisher: "Pearson Education",
        category: "Computer Science",
        edition: "3rd Edition",
        total_copies: 3,
        available_copies: 1,
        shelf_number: "CS-D2"
    },
    {
        book_id: "LIB015",
        title: "Microprocessor Architecture, Programming, and Applications",
        author: "Ramesh S. Gaonkar",
        isbn: "978-8131705988",
        publisher: "Penram International Publishing",
        category: "Electronics",
        edition: "5th Edition",
        total_copies: 4,
        available_copies: 3,
        shelf_number: "EC-B1"
    },
    {
        book_id: "LIB016",
        title: "Fluid Mechanics",
        author: "R.K. Bansal",
        isbn: "978-8131808153",
        publisher: "Laxmi Publications",
        category: "Mechanical",
        edition: "9th Edition",
        total_copies: 3,
        available_copies: 2,
        shelf_number: "ME-A1"
    },
    {
        book_id: "LIB017",
        title: "Strength of Materials",
        author: "R.K. Rajput",
        isbn: "978-8121935029",
        publisher: "S. Chand Publishing",
        category: "Civil",
        edition: "6th Edition",
        total_copies: 4,
        available_copies: 3,
        shelf_number: "CE-A1"
    },
    {
        book_id: "LIB018",
        title: "Engineering Drawing",
        author: "N.D. Bhatt",
        isbn: "978-9380358178",
        publisher: "Charotar Publishing",
        category: "General Engineering",
        edition: "53rd Edition",
        total_copies: 6,
        available_copies: 5,
        shelf_number: "GE-A1"
    },
    {
        book_id: "LIB019",
        title: "Engineering Chemistry",
        author: "Jain & Jain",
        isbn: "978-8177582093",
        publisher: "Dhanpat Rai Publishing",
        category: "Chemistry",
        edition: "16th Edition",
        total_copies: 4,
        available_copies: 3,
        shelf_number: "CH-A1"
    },
    {
        book_id: "LIB020",
        title: "Probability and Statistics for Engineers",
        author: "Ronald E. Walpole",
        isbn: "978-9332519091",
        publisher: "Pearson Education",
        category: "Mathematics",
        edition: "9th Edition",
        total_copies: 3,
        available_copies: 2,
        shelf_number: "MA-C1"
    }
];

// --- Transactions Table ---
// Sample issue/return transactions
let transactions = [
    {
        transaction_id: "TXN001",
        user_id: "STU2023001",
        book_id: "LIB001",
        issue_date: "2026-09-20",
        due_date: "2026-10-04",
        return_date: "2026-10-03",
        fine: 0,
        status: "Returned"
    },
    {
        transaction_id: "TXN002",
        user_id: "STU2023001",
        book_id: "LIB002",
        issue_date: "2026-09-25",
        due_date: "2026-10-09",
        return_date: null,
        fine: 0,
        status: "Issued"
    },
    {
        transaction_id: "TXN003",
        user_id: "STU2023001",
        book_id: "LIB005",
        issue_date: "2026-09-28",
        due_date: "2026-10-12",
        return_date: null,
        fine: 0,
        status: "Issued"
    },
    {
        transaction_id: "TXN004",
        user_id: "STU2023002",
        book_id: "LIB013",
        issue_date: "2026-09-15",
        due_date: "2026-09-29",
        return_date: null,
        fine: 0,
        status: "Overdue"
    },
    {
        transaction_id: "TXN005",
        user_id: "STU2023003",
        book_id: "LIB006",
        issue_date: "2026-09-22",
        due_date: "2026-10-06",
        return_date: "2026-10-05",
        fine: 0,
        status: "Returned"
    },
    {
        transaction_id: "TXN006",
        user_id: "TCH2023001",
        book_id: "LIB002",
        issue_date: "2026-09-10",
        due_date: "2026-10-10",
        return_date: null,
        fine: 0,
        status: "Issued"
    },
    {
        transaction_id: "TXN007",
        user_id: "TCH2023001",
        book_id: "LIB013",
        issue_date: "2026-09-12",
        due_date: "2026-10-12",
        return_date: null,
        fine: 0,
        status: "Issued"
    },
    {
        transaction_id: "TXN008",
        user_id: "TCH2023001",
        book_id: "LIB014",
        issue_date: "2026-09-05",
        due_date: "2026-10-05",
        return_date: "2026-10-02",
        fine: 0,
        status: "Returned"
    },
    {
        transaction_id: "TXN009",
        user_id: "TCH2023002",
        book_id: "LIB003",
        issue_date: "2026-09-18",
        due_date: "2026-10-18",
        return_date: null,
        fine: 0,
        status: "Issued"
    },
    {
        transaction_id: "TXN010",
        user_id: "NTS2023001",
        book_id: "LIB018",
        issue_date: "2026-09-20",
        due_date: "2026-10-11",
        return_date: "2026-10-08",
        fine: 0,
        status: "Returned"
    },
    {
        transaction_id: "TXN011",
        user_id: "NTS2023002",
        book_id: "LIB002",
        issue_date: "2026-09-08",
        due_date: "2026-09-29",
        return_date: null,
        fine: 0,
        status: "Overdue"
    },
    {
        transaction_id: "TXN012",
        user_id: "STU2023004",
        book_id: "LIB016",
        issue_date: "2026-09-30",
        due_date: "2026-10-14",
        return_date: null,
        fine: 0,
        status: "Issued"
    },
    {
        transaction_id: "TXN013",
        user_id: "STU2023002",
        book_id: "LIB013",
        issue_date: "2026-08-10",
        due_date: "2026-08-24",
        return_date: "2026-08-30",
        fine: 12,
        status: "Returned"
    },
    {
        transaction_id: "TXN014",
        user_id: "TCH2023003",
        book_id: "LIB012",
        issue_date: "2026-09-01",
        due_date: "2026-10-01",
        return_date: "2026-09-28",
        fine: 0,
        status: "Returned"
    }
];


// ============================================================
// Helper functions to query mock data
// (These simulate database queries)
// ============================================================

function getBookById(bookId) {
    if (!bookId) return null;
    const str = String(bookId).trim().toLowerCase();
    return books.find(b =>
        String(b.book_id || '').toLowerCase() === str ||
        String(b.book_code || '').toLowerCase() === str ||
        String(b.isbn || '').toLowerCase() === str ||
        ('lib' + String(b.book_id).padStart(3, '0')).toLowerCase() === str
    );
}

function getUserById(userId) {
    if (!userId) return null;
    const str = String(userId).trim().toLowerCase();
    const cleanNum = parseInt(str.replace(/\D/g, ''), 10);
    return users.find(u => {
        if (!u) return false;
        if (String(u.user_id || '').toLowerCase() === str) return true;
        if (String(u.member_id || '').toLowerCase() === str) return true;
        if (String(u.numeric_id || '').toLowerCase() === str) return true;
        if (String(u.email || '').toLowerCase() === str) return true;
        if (String(u.name || '').toLowerCase() === str) return true;
        if (!isNaN(cleanNum) && (Number(u.member_id) === cleanNum || Number(u.numeric_id) === cleanNum)) return true;
        return false;
    });
}

function getRulesForUserType(userType) {
    return libraryRules.find(r => r.user_type === userType);
}

function getTransactionsForUser(userId) {
    if (!userId) return [];
    const str = String(userId).trim().toLowerCase();
    const cleanNum = parseInt(str.replace(/\D/g, ''), 10);
    const u = getUserById(userId);
    const targetMemberId = u ? (u.member_id != null ? Number(u.member_id) : (u.numeric_id != null ? Number(u.numeric_id) : null)) : (!isNaN(cleanNum) ? cleanNum : null);
    const targetUserId = u ? String(u.user_id || '').toLowerCase() : str;
    const targetEmail = u ? String(u.email || '').toLowerCase() : '';
    const targetName = u ? String(u.name || '').toLowerCase() : '';

    return transactions.filter(t => {
        if (!t) return false;
        const tUser = String(t.user_id || '').toLowerCase();
        const tMemberId = t.member_id != null ? Number(t.member_id) : null;
        const tName = String(t.member_name || '').toLowerCase();

        if (tUser === str || tUser === targetUserId) return true;
        if (targetMemberId != null && tMemberId === targetMemberId) return true;
        if (targetEmail && (tUser === targetEmail || String(t.email || '').toLowerCase() === targetEmail)) return true;
        if (targetName && (tName === targetName || tUser === targetName)) return true;
        if (!isNaN(cleanNum) && tMemberId === cleanNum) return true;
        return false;
    });
}

function getActiveTransactionsForUser(userId) {
    return getTransactionsForUser(userId).filter(t => t.status === "Issued" || t.status === "Overdue");
}

function getReturnedTransactionsForUser(userId) {
    return getTransactionsForUser(userId).filter(t => t.status === "Returned");
}

function getAllIssuedBooks() {
    return transactions.filter(t => t.status === "Issued" || t.status === "Overdue");
}

function getOverdueBooks() {
    return transactions.filter(t => t.status === "Overdue");
}

function searchBooks(query) {
    const raw = String(query || '').trim();
    if (!raw) return books;
    const q = raw.toLowerCase();
    const cleanQ = q.replace(/[-\s]/g, '');
    const words = q.split(/\s+/).filter(Boolean);

    return books.filter(b => {
        const title = (b.title || '').toLowerCase();
        const author = (b.author || '').toLowerCase();
        const category = (b.category || '').toLowerCase();
        const isbn = (b.isbn || '').toLowerCase();
        const cleanIsbn = isbn.replace(/[-\s]/g, '');
        const bookId = (b.book_id || b.book_code || '').toLowerCase();
        const publisher = (b.publisher || '').toLowerCase();
        const shelf = (b.shelf_number || '').toLowerCase();
        const edition = (b.edition || '').toLowerCase();

        // 1. Single direct substring match
        if (title.includes(q) || author.includes(q) || category.includes(q) ||
            bookId.includes(q) || publisher.includes(q) || shelf.includes(q) ||
            edition.includes(q) || isbn.includes(q) || (cleanQ.length >= 3 && cleanIsbn.includes(cleanQ))) {
            return true;
        }

        // 2. Multi-word search: all words must match at least one field
        if (words.length > 1) {
            const allWordsMatch = words.every(w => {
                const cleanW = w.replace(/[-\s]/g, '');
                return title.includes(w) || author.includes(w) || category.includes(w) ||
                       bookId.includes(w) || publisher.includes(w) || shelf.includes(w) ||
                       isbn.includes(w) || (cleanW.length >= 3 && cleanIsbn.includes(cleanW));
            });
            if (allWordsMatch) return true;
        }

        return false;
    });
}

// Get rich suggestion objects with highlight metadata
function getSearchSuggestions(query, limit = 7) {
    const raw = String(query || '').trim();
    if (!raw || raw.length < 1) return [];

    const matches = searchBooks(raw);
    const q = raw.toLowerCase();
    const cleanQ = q.replace(/[-\s]/g, '');

    return matches.slice(0, limit).map(book => {
        let matchReason = "Title";
        let matchDetail = book.title;

        if (book.title.toLowerCase().includes(q)) {
            matchReason = "Title";
            matchDetail = book.title;
        } else if (book.author.toLowerCase().includes(q)) {
            matchReason = "Author";
            matchDetail = book.author;
        } else if (book.category.toLowerCase().includes(q)) {
            matchReason = "Category";
            matchDetail = book.category;
        } else if (book.isbn.toLowerCase().includes(q) || book.isbn.replace(/[-\s]/g, '').includes(cleanQ)) {
            matchReason = "ISBN";
            matchDetail = book.isbn;
        } else if ((book.book_id && book.book_id.toLowerCase().includes(q)) || (book.book_code && book.book_code.toLowerCase().includes(q))) {
            matchReason = "Book ID";
            matchDetail = book.book_id || book.book_code;
        } else if (book.shelf_number && book.shelf_number.toLowerCase().includes(q)) {
            matchReason = "Shelf";
            matchDetail = book.shelf_number;
        } else if (book.publisher && book.publisher.toLowerCase().includes(q)) {
            matchReason = "Publisher";
            matchDetail = book.publisher;
        }

        return {
            book: book,
            matchReason: matchReason,
            matchDetail: matchDetail
        };
    });
}

function filterBooks(bookList, filters) {
    let result = [...bookList];

    if (filters.category && filters.category !== "all") {
        result = result.filter(b => b.category === filters.category);
    }
    if (filters.availability && filters.availability !== "all") {
        if (filters.availability === "available") {
            result = result.filter(b => b.available_copies > 0);
        } else if (filters.availability === "issued") {
            result = result.filter(b => b.available_copies === 0);
        }
    }
    if (filters.author && filters.author.trim() !== "") {
        result = result.filter(b => b.author.toLowerCase().includes(filters.author.toLowerCase()));
    }

    return result;
}

function getBookCategories() {
    const cats = new Set();
    books.forEach(b => cats.add(b.category));
    return Array.from(cats).sort();
}

// Generate a new transaction ID
function generateTransactionId() {
    const maxId = transactions.reduce((max, t) => {
        const num = parseInt(t.transaction_id.replace("TXN", ""));
        return num > max ? num : max;
    }, 0);
    return "TXN" + String(maxId + 1).padStart(3, "0");
}

// Generate a new book ID
function generateBookId() {
    const maxId = books.reduce((max, b) => {
        const num = parseInt(b.book_id.replace("LIB", ""));
        return num > max ? num : max;
    }, 0);
    return "LIB" + String(maxId + 1).padStart(3, "0");
}

// Generate new user ID based on type
function generateUserId(userType) {
    let prefix;
    if (userType === "Student") prefix = "STU";
    else if (userType === "Teacher") prefix = "TCH";
    else prefix = "NTS";

    const filtered = users.filter(u => u.user_id.startsWith(prefix));
    const maxNum = filtered.reduce((max, u) => {
        const num = parseInt(u.user_id.replace(prefix, ""));
        return num > max ? num : max;
    }, 0);
    return prefix + String(maxNum + 1).padStart(7, "0");
}

// Calculate fine for overdue return
function calculateFine(userType, dueDate, returnDate) {
    const rules = getRulesForUserType(userType);
    if (!rules) return 0;

    const due = new Date(dueDate);
    const ret = new Date(returnDate || new Date());

    const diffTime = ret.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 0;
    return diffDays * rules.fine_per_day;
}

// Format date for display
function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// Get today's date as YYYY-MM-DD
function getTodayStr() {
    const d = new Date();
    return d.toISOString().split("T")[0];
}

// Add days to a date string, return YYYY-MM-DD
function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
}

// ============================================================
// LocalStorage Persistence Layer
// Keeps all tables in sync across pages and browser refreshes
// ============================================================

const STORAGE_KEYS = {
    DEPARTMENTS: "lms_departments",
    RULES: "lms_rules",
    USERS: "lms_users",
    BOOKS: "lms_books",
    TRANSACTIONS: "lms_transactions"
};

function saveBooks() {
    try { localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books)); } catch (e) {}
}

function saveTransactions() {
    try { localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)); } catch (e) {}
}

function saveUsers() {
    try { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); } catch (e) {}
}

function saveLibraryRules() {
    try { localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(libraryRules)); } catch (e) {}
}

function saveDepartments() {
    try { localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments)); } catch (e) {}
}

function saveAllData() {
    saveBooks();
    saveTransactions();
    saveUsers();
    saveLibraryRules();
    saveDepartments();
}

function resetDatabase() {
    Object.values(STORAGE_KEYS).forEach(function (k) { localStorage.removeItem(k); });
    location.reload();
}

// Load persisted data if available, otherwise initialize storage
(function initDatabase() {
    try {
        const storedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
        if (storedBooks) {
            books = JSON.parse(storedBooks);
        } else {
            saveBooks();
        }

        const storedTxns = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        if (storedTxns) {
            transactions = JSON.parse(storedTxns);
        } else {
            saveTransactions();
        }

        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        if (storedUsers) {
            users = JSON.parse(storedUsers);
        } else {
            saveUsers();
        }

        const storedRules = localStorage.getItem(STORAGE_KEYS.RULES);
        if (storedRules) {
            libraryRules = JSON.parse(storedRules);
        } else {
            saveLibraryRules();
        }

        const storedDepts = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
        if (storedDepts) {
            departments = JSON.parse(storedDepts);
        } else {
            saveDepartments();
        }
    } catch (err) {
        console.error("Error loading library data from localStorage:", err);
    }
})();

// ============================================================
// Synchronize in-memory cache with live MySQL Database
// ============================================================
async function syncDatabaseWithBackend() {
    if (typeof LibraryAPI === "undefined") return;
    const isOnline = await LibraryAPI.checkBackend();
    if (!isOnline) return;

    try {
        const remoteBooks = await LibraryAPI.getBooks();
        if (Array.isArray(remoteBooks) && remoteBooks.length > 0) {
            books = remoteBooks.map(b => ({
                book_id: b.formatted_id || `LIB${String(b.book_id).padStart(3, '0')}`,
                numeric_id: b.book_id,
                title: b.title,
                author: b.author,
                isbn: b.isbn,
                publisher: b.publisher,
                category: b.category,
                category_id: b.category_id,
                edition: b.edition,
                total_copies: Number(b.total_copies),
                available_copies: Number(b.available_copies),
                shelf_number: b.shelf_number
            }));
            saveBooks();
        }

        const remoteMembers = await LibraryAPI.getMembers();
        if (Array.isArray(remoteMembers) && remoteMembers.length > 0) {
            users = remoteMembers.map(m => {
                const formattedId = m.type_name === 'Librarian' ? `LIB${String(m.member_id).padStart(3, '0')}` :
                    (m.type_name === 'Student' ? `STU${String(m.member_id).padStart(7, '0')}` : `EMP${String(m.member_id).padStart(7, '0')}`);
                return {
                    user_id: formattedId,
                    numeric_id: m.member_id,
                    member_id: m.member_id,
                    name: m.name,
                    email: m.email,
                    phone: m.phone || '—',
                    department: m.department || 'General',
                    user_type: m.type_name,
                    role: m.role,
                    active_loans: Number(m.active_loans || 0)
                };
            });
            saveUsers();
        }

        const remoteTxns = await LibraryAPI.getTransactions();
        if (Array.isArray(remoteTxns) && remoteTxns.length > 0) {
            transactions = remoteTxns.map(t => {
                const formattedUserId = t.member_type === 'Librarian' ? `LIB${String(t.member_id).padStart(3, '0')}` :
                    (t.member_type === 'Student' ? `STU${String(t.member_id).padStart(7, '0')}` : `EMP${String(t.member_id).padStart(7, '0')}`);
                return {
                    transaction_id: `TXN${String(t.borrow_id).padStart(3, '0')}`,
                    borrow_id: t.borrow_id,
                    user_id: formattedUserId,
                    member_id: t.member_id,
                    member_name: t.member_name,
                    book_id: t.book_code || `LIB${String(t.book_id).padStart(3, '0')}`,
                    book_title: t.book_title,
                    issue_date: t.issue_date,
                    due_date: t.due_date,
                    return_date: t.return_date,
                    fine: Number(t.fine_amount || 0),
                    status: t.status
                };
            });
            saveTransactions();
        }
    } catch (err) {
        console.warn("[Data Sync] Error syncing with database:", err);
    }
}

window.syncDatabaseWithBackend = syncDatabaseWithBackend;

// Trigger sync on load
if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            syncDatabaseWithBackend();
        });
    } else {
        syncDatabaseWithBackend();
    }
}
