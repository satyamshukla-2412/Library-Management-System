# College Library Management System

A full-stack College Library Management System built with **HTML5, CSS3, Vanilla JavaScript, Node.js, Express**, and a **MySQL 8+** relational database.

Designed for college library operations where **Students, Teachers, and Non-Teaching Staff** can search, borrow, renew, and return books under differentiated borrowing rules, loan periods, and fine rates.

---

## 🚀 Features

- **Role-Based Borrowing Policies**:
  - **Students**: 3 books, 14-day loan period, 1 renewal, ₹2/day fine. Reference books restricted.
  - **Teachers**: 10 books, 60-day loan period, 3 renewals, ₹1/day fine. Reference books permitted (3 days).
  - **Non-Teaching Staff**: 5 books, 30-day loan period, 2 renewals, ₹1/day fine. Reference books restricted.
  - **Librarians**: Administrative dashboard for issuing, returning, cataloguing, and member management.

- **Automated MySQL 8+ Engine**:
  - Direct copy tracking (`total_copies`, `available_copies`) with integrity constraints.
  - Stored Procedures: `sp_issue_book`, `sp_return_book`, `sp_renew_book`, `sp_pay_fine`.
  - Reporting Views: `v_current_borrows`, `v_overdue_books`, `v_member_summary`.
  - Atomicity with `START TRANSACTION ... COMMIT`.

- **Web Application Architecture**:
  - **Frontend**: Clean academic portal interface with responsive navbar, real-time catalog search/filters, dynamic modals, and account history.
  - **Backend API**: Node.js & Express REST endpoints interfacing with MySQL via connection pooling (`mysql2/promise`).
  - **Dual Mode**: Direct live MySQL connection with automated fallback to persistent client-side storage.

---

## 📁 Project Structure

```text
├── database/
│   └── schema.sql        # Complete MySQL 8+ database schema, procedures & views
├── css/
│   └── style.css         # Academic portal design & responsive layout
├── js/
│   ├── api.js            # Client-side API layer communicating with Express
│   ├── app.js            # Core application utilities (modals, toasts, borrow/return)
│   ├── auth.js           # Authentication & session management
│   └── data.js           # Data queries, formatting, and offline persistence
├── index.html            # Home page with quick stats & popular books
├── books.html            # Book catalog with search & multi-facet filtering
├── rules.html            # Official library borrowing rules and fine structure
├── about.html            # Library overview, timings, facilities & contact info
├── login.html            # User authentication for students, teachers, staff, librarians
├── account.html          # Member dashboard (currently borrowed, history, fines)
├── librarian.html        # Librarian operations & inventory management
├── db.js                 # MySQL connection pool
├── server.js             # Express REST API server
├── package.json          # Node.js dependencies & scripts
├── .env.example          # Environment variable template
└── .gitignore            # Git exclusion rules
```

---

## 🛠️ Quick Start

### 1. Database Setup
1. Open MySQL Workbench or your MySQL terminal.
2. Run the script:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   This creates the `library_db` database, tables, seed data, stored procedures, and views.

### 2. Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your MySQL credentials:
   ```ini
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=library_db
   ```

### 3. Run the Application
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open your browser at **`http://localhost:3000`**.

---

## 👥 Default Demo Credentials

| Role | User ID / Email | Password |
| :--- | :--- | :--- |
| **Student** | `rahul.sharma@college.edu.in` | `rahul123` |
| **Teacher** | `suresh.iyer@college.edu.in` | `suresh123` |
| **Staff** | `sunita.rao@college.edu.in` | `sunita123` |
| **Librarian** | `vikram.singh@college.edu.in` | `admin123` |

---

## 📜 License
This project is for academic coursework and educational use.
