// ============================================================
// Main Application Logic
// Common functions used across all pages:
// navigation, modals, notifications, etc.
// ============================================================

// --- Mobile Navigation Toggle ---
function initMobileNav() {
    const hamburger = document.getElementById("hamburger-btn");
    const navMenu = document.getElementById("nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", function () {
            navMenu.classList.toggle("nav-open");
            hamburger.classList.toggle("active");
        });

        // Close menu when a link is clicked
        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", function () {
                navMenu.classList.remove("nav-open");
                hamburger.classList.remove("active");
            });
        });
    }
}

// --- Highlight Current Page in Nav ---
function highlightCurrentNav() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPage) {
            link.classList.add("active");
        }
    });
}

// --- Toast Notification ---
function showToast(message, type) {
    // type: "success", "error", "warning", "info"
    type = type || "info";

    // Remove existing toast
    const existing = document.querySelector(".toast-notification");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast-notification toast-" + type;
    toast.innerHTML = '<span>' + message + '</span><button class="toast-close" onclick="this.parentElement.remove()">&times;</button>';
    document.body.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(function () {
        if (toast.parentElement) {
            toast.classList.add("toast-fade-out");
            setTimeout(function () { toast.remove(); }, 300);
        }
    }, 4000);
}

// --- Modal ---
function showModal(title, bodyHTML, footerHTML) {
    // Remove existing modal
    closeModal();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "modal-overlay";
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
    });

    let modalHTML = '<div class="modal">';
    modalHTML += '<div class="modal-header">';
    modalHTML += '<h3>' + title + '</h3>';
    modalHTML += '<button class="modal-close-btn" onclick="closeModal()">&times;</button>';
    modalHTML += '</div>';
    modalHTML += '<div class="modal-body">' + bodyHTML + '</div>';
    if (footerHTML) {
        modalHTML += '<div class="modal-footer">' + footerHTML + '</div>';
    }
    modalHTML += '</div>';

    overlay.innerHTML = modalHTML;
    document.body.appendChild(overlay);

    // Prevent background scroll
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = "";
    }
}

// --- Confirm Dialog ---
function showConfirm(message, onConfirm) {
    const bodyHTML = '<p>' + message + '</p>';
    const footerHTML = '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" id="confirm-yes-btn">Confirm</button>';

    showModal("Confirm Action", bodyHTML, footerHTML);

    document.getElementById("confirm-yes-btn").addEventListener("click", function () {
        closeModal();
        if (onConfirm) onConfirm();
    });
}

// --- Book Issue Logic ---
function borrowBook(bookId) {
    const user = getCurrentUser();

    // Check if logged in
    if (!user) {
        showToast("Please log in to borrow books.", "warning");
        setTimeout(function () {
            window.location.href = "login.html";
        }, 1500);
        return;
    }

    // Librarians don't borrow
    if (user.user_type === "Librarian") {
        showToast("Librarians manage books through the Librarian Dashboard.", "info");
        return;
    }

    const book = getBookById(bookId);
    if (!book) {
        showToast("Book not found.", "error");
        return;
    }

    // Check availability
    if (book.available_copies <= 0) {
        showToast("This book is currently unavailable. All copies have been issued.", "error");
        return;
    }

    // Get rules for user type
    const rules = getRulesForUserType(user.user_type);
    if (!rules) {
        showToast("Borrowing rules not found for your user type.", "error");
        return;
    }

    // Check borrowing limit
    const activeBooks = getActiveTransactionsForUser(user.user_id);
    if (activeBooks.length >= rules.maximum_books) {
        showToast("Borrowing limit reached (" + rules.maximum_books + " books). Please return an existing book before borrowing another.", "warning");
        return;
    }

    // Check for overdue books
    const overdueBooks = activeBooks.filter(t => t.status === "Overdue");
    if (overdueBooks.length > 0) {
        showToast("You have " + overdueBooks.length + " overdue book(s). Please return them before borrowing another book.", "warning");
        return;
    }

    // Check if user already has this book
    const alreadyBorrowed = activeBooks.find(t => t.book_id === bookId);
    if (alreadyBorrowed) {
        showToast("You have already borrowed this book.", "info");
        return;
    }

    // Check unpaid fines
    const userTransactions = getTransactionsForUser(user.user_id);
    const totalFine = userTransactions.reduce((sum, t) => sum + (t.fine || 0), 0);
    // For simplicity, we track unpaid fines on returned books with fine > 0
    // In a real system, there would be a separate fine payment table

    // All checks passed — confirm borrowing
    const issueDate = getTodayStr();
    const dueDate = addDays(issueDate, rules.borrowing_days);

    const bodyHTML = '<div class="borrow-confirm-details">' +
        '<p><strong>Book:</strong> ' + book.title + '</p>' +
        '<p><strong>Author:</strong> ' + book.author + '</p>' +
        '<p><strong>Issue Date:</strong> ' + formatDate(issueDate) + '</p>' +
        '<p><strong>Due Date:</strong> ' + formatDate(dueDate) + '</p>' +
        '<p><strong>Your Type:</strong> ' + user.user_type + '</p>' +
        '<p><strong>Remaining Limit:</strong> ' + Math.max(0, rules.maximum_books - activeBooks.length - 1) + ' books after this issue</p>' +
        '</div>';

    const footerHTML = '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" id="confirm-borrow-btn">Confirm Borrow</button>';

    showModal("Borrow Book", bodyHTML, footerHTML);

    document.getElementById("confirm-borrow-btn").addEventListener("click", async function () {
        const btn = document.getElementById("confirm-borrow-btn");
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Processing...";
        }

        let serverDueDate = dueDate;
        let serverBorrowId = generateTransactionId();

        // 1. Call Backend MySQL Stored Procedure
        try {
            if (typeof LibraryAPI !== "undefined") {
                const res = await LibraryAPI.borrowBook(user.member_id || user.user_id, book.book_id || bookId);
                if (res) {
                    if (res.success) {
                        if (res.dueDate) serverDueDate = String(res.dueDate).split('T')[0];
                        if (res.borrowId) serverBorrowId = "TXN" + String(res.borrowId).padStart(3, "0");
                    } else {
                        showToast(res.message || "Could not borrow book.", "error");
                        if (btn) {
                            btn.disabled = false;
                            btn.textContent = "Confirm Borrow";
                        }
                        return;
                    }
                }
            }
        } catch (err) {
            console.warn("[Borrow] Backend API error:", err);
        }

        // 2. Create transaction locally for instant reactivity
        const txn = {
            transaction_id: serverBorrowId,
            user_id: user.user_id,
            book_id: book.book_id || bookId,
            issue_date: issueDate,
            due_date: serverDueDate,
            return_date: null,
            fine: 0,
            status: "Issued"
        };
        transactions.push(txn);

        // Update book availability locally
        book.available_copies = Math.max(0, book.available_copies - 1);

        // Save to persistent storage
        if (typeof saveTransactions === "function") saveTransactions();
        if (typeof saveBooks === "function") saveBooks();

        // 3. Synchronize cache from MySQL
        if (typeof syncDatabaseWithBackend === "function") {
            try {
                await syncDatabaseWithBackend();
            } catch (e) {}
        }

        closeModal();

        // Refresh book listing if on books page
        if (typeof renderBooks === "function") {
            renderBooks();
        }

        // Refresh account page if on account page
        if (typeof loadAccountData === "function") {
            loadAccountData();
        }

        // Show success with link to My Account
        const successBody = '<div class="issue-success" style="text-align:center; padding:15px 0;">' +
            '<div class="success-icon" style="font-size:3rem; color:#16a34a; margin-bottom:10px;">✓</div>' +
            '<h4 style="margin-bottom:15px; color:#1e293b;">Book Issued Successfully</h4>' +
            '<table class="detail-table" style="text-align:left; margin-bottom:20px;">' +
            '<tr><td>Book</td><td><strong>' + book.title + '</strong></td></tr>' +
            '<tr><td>Transaction ID</td><td>' + serverBorrowId + '</td></tr>' +
            '<tr><td>Issue Date</td><td>' + formatDate(issueDate) + '</td></tr>' +
            '<tr><td>Due Date</td><td>' + formatDate(serverDueDate) + '</td></tr>' +
            '<tr><td>Member</td><td>' + user.name + ' (' + user.user_type + ')</td></tr>' +
            '</table>' +
            '<div style="display:flex; gap:12px; justify-content:center;">' +
            '<a href="account.html" class="btn btn-primary">Go to My Account</a>' +
            '<button class="btn btn-secondary" onclick="closeModal()">Keep Browsing</button>' +
            '</div>' +
            '</div>';

        showModal("Book Issued", successBody, '');
        showToast("Book issued successfully! It is now in your account.", "success");
    });
}

// --- Return Book Logic ---
function returnBook(transactionId) {
    const user = getCurrentUser();
    if (!user) return;

    const txn = transactions.find(t => t.transaction_id === transactionId || String(t.borrow_id) === String(transactionId));
    const bookId = txn ? txn.book_id : transactionId;
    const book = getBookById(bookId);
    const returnDate = getTodayStr();
    const fine = txn ? calculateFine(user.user_type, txn.due_date, returnDate) : 0;

    let bodyHTML = '<p>Are you sure you want to return <strong>' + (book ? book.title : bookId) + '</strong>?</p>';

    if (fine > 0) {
        bodyHTML += '<div class="fine-warning">' +
            '<p><strong>⚠ Late Return</strong></p>' +
            '<p>This book is overdue. A fine of <strong>₹' + fine + '</strong> will be applied.</p>' +
            '</div>';
    }

    const footerHTML = '<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
        '<button class="btn btn-primary" id="confirm-return-btn">Confirm Return</button>';

    showModal("Return Book", bodyHTML, footerHTML);

    document.getElementById("confirm-return-btn").addEventListener("click", async function () {
        const btn = document.getElementById("confirm-return-btn");
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Returning...";
        }

        try {
            if (typeof LibraryAPI !== "undefined") {
                const res = await LibraryAPI.returnBook(user.member_id || user.user_id, (book ? book.book_id : bookId));
                if (res && res.success) {
                    showToast(res.message || "Book returned successfully!", "success");
                }
            }
        } catch (err) {
            console.warn("[Return] API return error:", err);
        }

        // Update transaction locally
        if (txn) {
            txn.return_date = returnDate;
            txn.fine = fine;
            txn.status = "Returned";
        }

        // Update book availability
        if (book) {
            book.available_copies++;
        }

        // Save to persistent storage
        if (typeof saveTransactions === "function") saveTransactions();
        if (typeof saveBooks === "function") saveBooks();

        // Sync with backend
        if (typeof syncDatabaseWithBackend === "function") {
            try {
                await syncDatabaseWithBackend();
            } catch (e) {}
        }

        closeModal();

        // Refresh account page
        if (typeof loadAccountData === "function") {
            await loadAccountData();
        }
        // Refresh catalog if open
        if (typeof renderBooks === "function") {
            renderBooks();
        }
    });
}

// --- View Book Details ---
async function viewBookDetails(bookId) {
    // Try local cache first
    let book = getBookById(bookId);

    // If not in local cache, try fetching from the backend API
    if (!book && typeof LibraryAPI !== "undefined") {
        try {
            const results = await LibraryAPI.searchBooks(String(bookId));
            if (results && results.length > 0) {
                const b = results[0];
                book = {
                    book_id: b.formatted_id || b.book_code || ('LIB' + String(b.book_id).padStart(3, '0')),
                    numeric_id: b.book_id,
                    title: b.title,
                    author: b.author,
                    isbn: b.isbn,
                    publisher: b.publisher,
                    category: b.category,
                    edition: b.edition,
                    total_copies: Number(b.total_copies),
                    available_copies: Number(b.available_copies),
                    shelf_number: b.shelf_number
                };
            }
        } catch (err) {
            console.warn("[viewBookDetails] API fetch failed:", err);
        }
    }

    if (!book) {
        showToast("Book not found.", "error");
        return;
    }

    const user = getCurrentUser();
    const statusClass = book.available_copies > 0 ? "status-available" : "status-issued";
    const statusText = book.available_copies > 0 ? "Available" : "All Copies Issued";

    let bodyHTML = '<table class="detail-table">' +
        '<tr><td>Book ID</td><td>' + (book.book_id || bookId) + '</td></tr>' +
        '<tr><td>Title</td><td>' + book.title + '</td></tr>' +
        '<tr><td>Author</td><td>' + book.author + '</td></tr>' +
        '<tr><td>ISBN</td><td>' + (book.isbn || '—') + '</td></tr>' +
        '<tr><td>Publisher</td><td>' + (book.publisher || '—') + '</td></tr>' +
        '<tr><td>Category</td><td>' + (book.category || '—') + '</td></tr>' +
        '<tr><td>Edition</td><td>' + (book.edition || '—') + '</td></tr>' +
        '<tr><td>Total Copies</td><td>' + book.total_copies + '</td></tr>' +
        '<tr><td>Available Copies</td><td>' + book.available_copies + '</td></tr>' +
        '<tr><td>Shelf Number</td><td>' + (book.shelf_number || '—') + '</td></tr>' +
        '<tr><td>Status</td><td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td></tr>' +
        '</table>';

    let footerHTML = '<button class="btn btn-secondary" onclick="closeModal()">Close</button>';

    // Show borrow button if user is logged in and book is available
    if (user && user.user_type !== "Librarian" && book.available_copies > 0) {
        footerHTML += '<button class="btn btn-primary" onclick="closeModal(); borrowBook(\'' + book.book_id + '\')">Borrow Book</button>';
    } else if (!user && book.available_copies > 0) {
        footerHTML += '<a href="login.html" class="btn btn-primary">Login to Borrow</a>';
    }

    showModal("Book Details", bodyHTML, footerHTML);
}

// --- Initialize Common Page Elements ---
document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    highlightCurrentNav();
    updateNavForAuth();
});
