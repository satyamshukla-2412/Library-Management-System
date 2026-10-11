-- =====================================================
-- COLLEGE LIBRARY MANAGEMENT SYSTEM (MySQL 8+)
-- Database Schema, Constraints, Stored Procedures & Views
-- =====================================================

DROP DATABASE IF EXISTS library_db;
CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_db;

-- Disable MySQL Safe Updates mode for initial batch seeding
SET SQL_SAFE_UPDATES = 0;

-- -----------------------------------------------------
-- 1. MEMBER_TYPE : Borrowing policies per user role
-- -----------------------------------------------------
CREATE TABLE member_type (
    type_id              INT AUTO_INCREMENT PRIMARY KEY,
    type_name            VARCHAR(30) NOT NULL UNIQUE,
    max_books            INT NOT NULL,
    loan_days            INT NOT NULL,
    renewal_limit        INT NOT NULL,
    fine_per_day         DECIMAL(6,2) NOT NULL,
    reference_allowed    BOOLEAN NOT NULL DEFAULT FALSE,
    reference_loan_days  INT NOT NULL DEFAULT 0,
    max_unpaid_fine      DECIMAL(8,2) NOT NULL
) ENGINE=InnoDB;

INSERT INTO member_type
(type_id, type_name, max_books, loan_days, renewal_limit, fine_per_day, reference_allowed, reference_loan_days, max_unpaid_fine)
VALUES
(1, 'Student',            3, 14, 1, 2.00, FALSE, 0, 100.00),
(2, 'Teacher',           10, 60, 3, 1.00, TRUE,  3, 500.00),
(3, 'Non-Teaching Staff', 5, 30, 2, 1.00, FALSE, 0, 200.00),
(4, 'Librarian',          0,  0, 0, 0.00, TRUE,  0,   0.00);

-- -----------------------------------------------------
-- 2. MEMBER : Students, Teachers, Staff, and Librarians
-- -----------------------------------------------------
CREATE TABLE member (
    member_id    INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(100) NOT NULL UNIQUE,
    phone        VARCHAR(15),
    department   VARCHAR(50),
    type_id      INT NOT NULL,
    password     VARCHAR(255) NOT NULL DEFAULT 'password123',
    role         ENUM('MEMBER', 'LIBRARIAN') NOT NULL DEFAULT 'MEMBER',
    join_date    DATE NOT NULL DEFAULT (CURRENT_DATE),
    status       ENUM('ACTIVE','SUSPENDED','LEFT') NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (type_id) REFERENCES member_type(type_id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 3. CATEGORY : Book subject classifications
-- -----------------------------------------------------
CREATE TABLE category (
    category_id   INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO category (category_id, category_name) VALUES
(1, 'Computer Science'),
(2, 'Mathematics'),
(3, 'Electronics'),
(4, 'Civil Engineering'),
(5, 'Mechanical Engineering'),
(6, 'Literature'),
(7, 'Physics'),
(8, 'Chemistry'),
(9, 'General Engineering');

-- -----------------------------------------------------
-- 4. BOOK : Catalog with copy stock tracking
-- -----------------------------------------------------
CREATE TABLE book (
    book_id          INT AUTO_INCREMENT PRIMARY KEY,
    title            VARCHAR(150) NOT NULL,
    author           VARCHAR(100) NOT NULL,
    publisher        VARCHAR(100),
    isbn             VARCHAR(20) UNIQUE,
    edition          VARCHAR(50) DEFAULT '1st Edition',
    shelf_number     VARCHAR(20) DEFAULT 'General',
    is_reference     BOOLEAN NOT NULL DEFAULT FALSE,
    total_copies     INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    category_id      INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(category_id) ON UPDATE CASCADE,
    CHECK (available_copies >= 0 AND available_copies <= total_copies)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 5. BORROWS : M:N issue/return transaction relationship
-- -----------------------------------------------------
CREATE TABLE borrows (
    borrow_id    INT AUTO_INCREMENT PRIMARY KEY,
    member_id    INT NOT NULL,
    book_id      INT NOT NULL,
    issue_date   DATE NOT NULL,
    due_date     DATE NOT NULL,
    return_date  DATE NULL,
    renew_count  INT NOT NULL DEFAULT 0,
    fine_amount  DECIMAL(8,2) NOT NULL DEFAULT 0,
    fine_paid    BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE RESTRICT,
    FOREIGN KEY (book_id)   REFERENCES book(book_id) ON DELETE RESTRICT,
    INDEX idx_active_borrow (member_id, book_id, return_date)
) ENGINE=InnoDB;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

INSERT INTO book (book_id, title, author, publisher, isbn, edition, shelf_number, is_reference, total_copies, available_copies, category_id) VALUES
(1, 'Database System Concepts',         'Silberschatz, Korth',   'McGraw-Hill', '978-0078022159', '7th Edition',  'CS-A1', FALSE, 5, 4, 1),
(2, 'Operating System Concepts',        'Galvin, Gagne',         'Wiley',       '978-1118063330', '10th Edition', 'CS-A2', FALSE, 4, 3, 1),
(3, 'Computer Networks',                'Andrew S. Tanenbaum',   'Pearson',     '978-9332518742', '5th Edition',  'CS-B1', FALSE, 4, 3, 1),
(4, 'Introduction to Algorithms',       'CLRS',                  'MIT Press',   '978-0262033848', '3rd Edition',  'CS-C1', FALSE, 3, 2, 1),
(5, 'Higher Engineering Mathematics',   'B.S. Grewal',           'Khanna',      '978-8174091956', '44th Edition', 'MA-A1', FALSE, 6, 5, 2),
(6, 'Digital Electronics',              'Morris Mano',           'Pearson',     '978-9332542525', '5th Edition',  'EC-A1', FALSE, 4, 4, 3),
(7, 'Basic Electrical Engineering',     'D.P. Kothari',          'McGraw-Hill', '978-9352605736', '4th Edition',  'EE-A1', FALSE, 3, 3, 3),
(8, 'Mechanics of Materials',           'R.C. Hibbeler',         'Pearson',     '978-0134319650', '10th Edition', 'ME-A1', FALSE, 3, 3, 5),
(9, 'Theory of Machines',               'S.S. Rattan',           'McGraw-Hill', '978-9351343479', '4th Edition',  'ME-B1', FALSE, 3, 3, 5),
(10, 'Surveying Volume 1',              'B.C. Punmia',           'Laxmi Pub',   '978-8170088530', '16th Edition', 'CE-A1', FALSE, 3, 3, 4),
(11, 'Engineering Physics',             'H.K. Malik',            'McGraw-Hill', '978-0070671539', '2nd Edition',  'PH-A1', FALSE, 3, 3, 7),
(12, 'Engineering Chemistry',           'Jain & Jain',           'Dhanpat Rai', '978-8177582093', '16th Edition', 'CH-A1', FALSE, 4, 4, 8),
(13, 'Encyclopedia of Computing',       'Various Authors',       'Oxford',      '978-0198609612', '1st Edition',  'REF-01', TRUE,  1, 1, 1),
(14, 'Oxford Advanced Learner Dictionary','A.S. Hornby',         'Oxford',      '978-0194799003', '9th Edition',  'REF-02', TRUE,  2, 2, 6),
(15, 'Data Structures Using C',         'Reema Thareja',         'Oxford University Press', '978-0198099307', '2nd Edition', 'CS-A3', FALSE, 5, 5, 1),
(16, 'Linear Algebra and Its Applications', 'Gilbert Strang',    'Cengage Learning', '978-8131501726', '4th Edition', 'MA-A2', FALSE, 3, 3, 2),
(17, 'Let Us C',                        'Yashavant Kanetkar',    'BPB Publications', '978-8183331630', '17th Edition', 'CS-A4', FALSE, 6, 6, 1),
(18, 'Modern Operating Systems',        'Andrew S. Tanenbaum',   'Pearson Education', '978-9332550575', '4th Edition', 'CS-C1', FALSE, 3, 3, 1),
(19, 'Software Engineering',            'Ian Sommerville',       'Pearson Education', '978-9332518858', '10th Edition', 'CS-C2', FALSE, 4, 4, 1),
(20, 'Discrete Mathematics and Its Applications', 'Kenneth H. Rosen', 'McGraw-Hill Education', '978-0070681880', '7th Edition', 'MA-B2', FALSE, 4, 4, 2),
(21, 'Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', 'Pearson Education', '978-9332543515', '3rd Edition', 'CS-D2', FALSE, 3, 3, 1),
(22, 'Microprocessor Architecture, Programming, and Applications', 'Ramesh S. Gaonkar', 'Penram International', '978-8131705988', '5th Edition', 'EC-B1', FALSE, 4, 4, 3),
(23, 'Fluid Mechanics',                 'R.K. Bansal',           'Laxmi Publications', '978-8131808153', '9th Edition', 'ME-A2', FALSE, 3, 3, 5),
(24, 'Strength of Materials',           'R.K. Rajput',           'S. Chand Publishing', '978-8121935029', '6th Edition', 'CE-A2', FALSE, 4, 4, 4),
(25, 'Engineering Drawing',             'N.D. Bhatt',            'Charotar Publishing', '978-9380358178', '53rd Edition', 'GE-A1', FALSE, 6, 6, 9),
(26, 'Probability and Statistics for Engineers', 'Ronald E. Walpole', 'Pearson Education', '978-9332519091', '9th Edition', 'MA-C1', FALSE, 3, 3, 2);

INSERT INTO member (member_id, name, email, phone, department, type_id, password, role) VALUES
(1, 'Rahul Sharma',    'rahul.sharma@college.edu.in', '9876543210', 'Computer Science',       1, 'rahul123',  'MEMBER'),
(2, 'Priya Patel',     'priya.patel@college.edu.in',  '9876543211', 'Electronics',            1, 'priya123',  'MEMBER'),
(3, 'Amit Kumar',      'amit.kumar@college.edu.in',   '9876543212', 'Mechanical Engineering', 1, 'amit123',   'MEMBER'),
(4, 'Dr. Suresh Iyer', 'suresh.iyer@college.edu.in',  '9876543220', 'Computer Science',       2, 'suresh123', 'MEMBER'),
(5, 'Prof. Meena Desai','meena.desai@college.edu.in', '9876543221', 'Mathematics',            2, 'meena123',  'MEMBER'),
(6, 'Sunita Rao',      'sunita.rao@college.edu.in',   '9876543230', 'Administration',         3, 'sunita123', 'MEMBER'),
(7, 'Ramesh Gupta',    'ramesh.gupta@college.edu.in', '9876543231', 'Library Support',        3, 'ramesh123', 'MEMBER'),
(8, 'Mr. Vikram Singh','vikram.singh@college.edu.in', '9876543200', 'Central Library',        4, 'admin123',  'LIBRARIAN');

INSERT INTO borrows (member_id, book_id, issue_date, due_date, return_date, renew_count, fine_amount, fine_paid) VALUES
(1, 1, '2026-09-20', '2026-10-04', '2026-10-03', 0, 0.00, TRUE),
(1, 2, '2026-09-25', '2026-10-09', NULL,         0, 0.00, TRUE),
(2, 3, '2026-09-28', '2026-10-12', NULL,         0, 0.00, TRUE),
(4, 4, '2026-08-15', '2026-10-14', NULL,         0, 0.00, TRUE),
(1, 5, '2026-09-10', '2026-09-24', NULL,         0, 24.00, FALSE); -- Overdue demo record

-- Update available copies to match sample borrows (using WHERE book_id > 0 to satisfy MySQL Safe Updates)
UPDATE book SET available_copies = total_copies - (
    SELECT COUNT(*) FROM borrows WHERE borrows.book_id = book.book_id AND borrows.return_date IS NULL
)
WHERE book_id > 0;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================
DELIMITER //

-- ---------- 1. ISSUE A BOOK ----------
CREATE PROCEDURE sp_issue_book(
    IN p_member_id INT,
    IN p_book_id   INT
)
proc_label: BEGIN
    DECLARE v_status      VARCHAR(20);
    DECLARE v_type_name   VARCHAR(30);
    DECLARE v_max_books   INT;
    DECLARE v_loan_days   INT;
    DECLARE v_ref_allowed BOOLEAN;
    DECLARE v_ref_days    INT;
    DECLARE v_max_fine    DECIMAL(8,2);
    DECLARE v_is_ref      BOOLEAN;
    DECLARE v_available   INT;
    DECLARE v_active      INT;
    DECLARE v_unpaid      DECIMAL(8,2);
    DECLARE v_holding     INT;
    DECLARE v_days        INT;

    -- Validate Member
    SELECT m.status, mt.type_name, mt.max_books, mt.loan_days, mt.reference_allowed,
           mt.reference_loan_days, mt.max_unpaid_fine
      INTO v_status, v_type_name, v_max_books, v_loan_days, v_ref_allowed, v_ref_days, v_max_fine
      FROM member m
      JOIN member_type mt ON m.type_id = mt.type_id
     WHERE m.member_id = p_member_id;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Member not found';
    END IF;
    IF v_status <> 'ACTIVE' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Member account is not active';
    END IF;
    IF v_type_name = 'Librarian' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Librarians manage books and do not borrow';
    END IF;

    -- Validate Book & Availability
    SELECT is_reference, available_copies
      INTO v_is_ref, v_available
      FROM book
     WHERE book_id = p_book_id;

    IF v_available IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Book not found';
    END IF;
    IF v_available <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No copies available for issue';
    END IF;

    -- Rule: Same member cannot borrow two copies of the same book simultaneously
    SELECT COUNT(*) INTO v_holding
      FROM borrows
     WHERE member_id = p_member_id AND book_id = p_book_id AND return_date IS NULL;
    IF v_holding > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Member already holds an active copy of this book';
    END IF;

    -- Rule: Book borrowing limit per member type
    SELECT COUNT(*) INTO v_active
      FROM borrows
     WHERE member_id = p_member_id AND return_date IS NULL;
    IF v_active >= v_max_books THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Borrowing limit reached for this member type';
    END IF;

    -- Rule: Unpaid fines threshold
    SELECT COALESCE(SUM(fine_amount), 0) INTO v_unpaid
      FROM borrows
     WHERE member_id = p_member_id AND fine_paid = FALSE;
    IF v_unpaid > v_max_fine THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unpaid fine exceeds permitted ceiling';
    END IF;

    -- Rule: Reference books check
    IF v_is_ref AND NOT v_ref_allowed THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reference books cannot be issued to this member category';
    END IF;

    SET v_days = IF(v_is_ref, v_ref_days, v_loan_days);

    -- Execute Issue
    START TRANSACTION;
        INSERT INTO borrows (member_id, book_id, issue_date, due_date, return_date, renew_count, fine_amount, fine_paid)
        VALUES (p_member_id, p_book_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL v_days DAY), NULL, 0, 0.00, TRUE);

        UPDATE book
           SET available_copies = available_copies - 1
         WHERE book_id = p_book_id;
    COMMIT;

    SELECT 'Book issued successfully' AS status_message,
           LAST_INSERT_ID() AS borrow_id,
           DATE_ADD(CURDATE(), INTERVAL v_days DAY) AS due_date;
END //

-- ---------- 2. RETURN A BOOK ----------
CREATE PROCEDURE sp_return_book(
    IN p_member_id INT,
    IN p_book_id   INT
)
BEGIN
    DECLARE v_borrow_id  INT;
    DECLARE v_issue_date DATE;
    DECLARE v_due        DATE;
    DECLARE v_rate       DECIMAL(6,2);
    DECLARE v_late       INT;
    DECLARE v_fine       DECIMAL(8,2);

    SELECT b.borrow_id, b.issue_date, b.due_date, mt.fine_per_day
      INTO v_borrow_id, v_issue_date, v_due, v_rate
      FROM borrows b
      JOIN member m       ON b.member_id = m.member_id
      JOIN member_type mt ON m.type_id   = mt.type_id
     WHERE b.member_id = p_member_id AND b.book_id = p_book_id AND b.return_date IS NULL
     LIMIT 1;

    IF v_borrow_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No active borrow record found for this member and book';
    END IF;

    SET v_late = GREATEST(DATEDIFF(CURDATE(), v_due), 0);
    SET v_fine = v_late * v_rate;

    START TRANSACTION;
        UPDATE borrows
           SET return_date = CURDATE(),
               fine_amount = v_fine,
               fine_paid   = (v_fine = 0)
         WHERE borrow_id = v_borrow_id;

        UPDATE book
           SET available_copies = available_copies + 1
         WHERE book_id = p_book_id;
    COMMIT;

    SELECT 'Book returned successfully' AS status_message,
           v_late AS days_overdue,
           v_fine AS calculated_fine;
END //

-- ---------- 3. RENEW A BOOK ----------
CREATE PROCEDURE sp_renew_book(
    IN p_member_id INT,
    IN p_book_id   INT
)
BEGIN
    DECLARE v_borrow_id  INT;
    DECLARE v_issue_date DATE;
    DECLARE v_due        DATE;
    DECLARE v_renewed    INT;
    DECLARE v_limit      INT;
    DECLARE v_days       INT;

    SELECT b.borrow_id, b.issue_date, b.due_date, b.renew_count, mt.renewal_limit, mt.loan_days
      INTO v_borrow_id, v_issue_date, v_due, v_renewed, v_limit, v_days
      FROM borrows b
      JOIN member m       ON b.member_id = m.member_id
      JOIN member_type mt ON m.type_id   = mt.type_id
     WHERE b.member_id = p_member_id AND b.book_id = p_book_id AND b.return_date IS NULL
     LIMIT 1;

    IF v_borrow_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No active borrow record found';
    END IF;
    IF v_due < CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Overdue books cannot be renewed; please return first';
    END IF;
    IF v_renewed >= v_limit THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maximum renewal limit reached for this loan';
    END IF;

    UPDATE borrows
       SET due_date = DATE_ADD(due_date, INTERVAL v_days DAY),
           renew_count = renew_count + 1
     WHERE borrow_id = v_borrow_id;

    SELECT 'Book renewed successfully' AS status_message,
           DATE_ADD(v_due, INTERVAL v_days DAY) AS new_due_date;
END //

-- ---------- 4. PAY FINE ----------
CREATE PROCEDURE sp_pay_fine(IN p_member_id INT)
BEGIN
    UPDATE borrows
       SET fine_paid = TRUE
     WHERE member_id = p_member_id AND fine_paid = FALSE AND borrow_id > 0;

    SELECT 'All pending fines cleared successfully' AS status_message;
END //

DELIMITER ;

-- =====================================================
-- VIEWS FOR REPORTS & DASHBOARDS
-- =====================================================

CREATE OR REPLACE VIEW v_current_borrows AS
SELECT br.borrow_id,
       m.member_id,
       m.name AS member_name,
       mt.type_name AS member_type,
       m.department,
       bk.book_id,
       bk.title AS book_title,
       bk.isbn,
       br.issue_date,
       br.due_date,
       br.renew_count,
       GREATEST(DATEDIFF(CURDATE(), br.due_date), 0) AS days_overdue,
       GREATEST(DATEDIFF(CURDATE(), br.due_date), 0) * mt.fine_per_day AS fine_accrued
  FROM borrows br
  JOIN member m       ON br.member_id = m.member_id
  JOIN member_type mt ON m.type_id    = mt.type_id
  JOIN book bk        ON br.book_id   = bk.book_id
 WHERE br.return_date IS NULL;

CREATE OR REPLACE VIEW v_overdue_books AS
SELECT *
  FROM v_current_borrows
 WHERE days_overdue > 0;

CREATE OR REPLACE VIEW v_member_summary AS
SELECT m.member_id,
       m.name,
       m.email,
       mt.type_name,
       COUNT(CASE WHEN b.return_date IS NULL THEN 1 END) AS currently_borrowed,
       COUNT(CASE WHEN b.return_date IS NOT NULL THEN 1 END) AS total_returned,
       COALESCE(SUM(CASE WHEN b.fine_paid = FALSE THEN b.fine_amount END), 0) AS unpaid_fines
  FROM member m
  JOIN member_type mt ON m.type_id = mt.type_id
  LEFT JOIN borrows b ON m.member_id = b.member_id
 GROUP BY m.member_id, m.name, m.email, mt.type_name;

-- Re-enable Safe Updates mode
SET SQL_SAFE_UPDATES = 1;
