// ============================================================
// API Client Layer
// Dynamically routes requests to MySQL Express Backend (if running)
// or gracefully falls back to localStorage/mock data if offline.
// ============================================================

const API_BASE = window.location.origin.startsWith("http") ? "" : "http://localhost:3000";

const LibraryAPI = {
    isServerAvailable: null,

    // Check backend health
    async checkBackend() {
        if (this.isServerAvailable !== null) return this.isServerAvailable;
        try {
            const res = await fetch(`${API_BASE}/api/status`, { method: "GET" });
            const data = await res.json();
            this.isServerAvailable = data.connected === true;
            if (this.isServerAvailable) {
                console.log("[LibraryAPI] Connected to live MySQL Backend:", data.database);
            }
            return this.isServerAvailable;
        } catch (err) {
            this.isServerAvailable = false;
            return false;
        }
    },

    // Login
    async login(userId, password, userType) {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, password, userType })
                });
                const data = await res.json();
                if (data.success && data.user) {
                    localStorage.setItem("library_current_user", JSON.stringify(data.user));
                }
                return data;
            } catch (err) {
                console.warn("[LibraryAPI] Server login failed, falling back to local:", err.message);
            }
        }
        // Fallback to local auth
        return loginUser(userId, password, userType);
    },

    // Sign Up / Register Member
    async signup(payload) {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    if (typeof users !== 'undefined' && Array.isArray(users)) {
                        users.push({
                            user_id: data.user_id || payload.email,
                            name: payload.name,
                            email: payload.email,
                            phone: payload.phone || "—",
                            department: payload.department || "General",
                            user_type: payload.userType,
                            password: payload.password
                        });
                    }
                }
                return data;
            } catch (err) {
                console.warn("[LibraryAPI] Server signup failed, falling back to local:", err.message);
            }
        }
        // Local fallback
        if (typeof users !== 'undefined' && Array.isArray(users)) {
            const exists = users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());
            if (exists) {
                return { success: false, message: "An account with this email already exists." };
            }
            const count = users.filter(u => u.user_type === payload.userType).length + 1;
            const prefix = payload.userType === "Student" ? "STU" : (payload.userType === "Teacher" ? "TCH" : (payload.userType === "Librarian" ? "LIB" : "NTS"));
            const newId = `${prefix}${String(count).padStart(3, "0")}`;
            users.push({
                user_id: newId,
                name: payload.name,
                email: payload.email,
                phone: payload.phone || "—",
                department: payload.department,
                user_type: payload.userType,
                password: payload.password
            });
            return {
                success: true,
                user_id: newId,
                email: payload.email,
                userType: payload.userType,
                message: `Account created successfully! Your Member ID is ${newId}.`
            };
        }
        return { success: false, message: "Registration service currently unavailable." };
    },

    // Borrow Book
    async borrowBook(memberId, bookId) {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/borrow`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ memberId, bookId })
                });
                return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Server borrow failed:", err.message);
            }
        }
        return null;
    },

    // Return Book
    async returnBook(memberId, bookId) {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/return`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ memberId, bookId })
                });
                return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Server return failed:", err.message);
            }
        }
        return null;
    },

    // Get Books
    async getBooks() {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/books`);
                if (res.ok) {
                    return await res.json();
                }
            } catch (err) {
                console.warn("[LibraryAPI] Fetch books from server failed:", err.message);
            }
        }
        return typeof books !== "undefined" ? books : [];
    },

    // Live Search Books API
    async searchBooks(query) {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/books/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    return await res.json();
                }
            } catch (err) {
                console.warn("[LibraryAPI] Server search failed:", err.message);
            }
        }
        if (typeof searchBooks === "function") {
            return searchBooks(query);
        }
        return [];
    },

    // Get Categories
    async getCategories() {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/categories`);
                if (res.ok) return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Fetch categories failed:", err.message);
            }
        }
        return [];
    },

    // Get Account Data
    async getAccountData(memberId) {
        const hasServer = await this.checkBackend();
        if (hasServer && memberId) {
            try {
                const res = await fetch(`${API_BASE}/api/my-account/${memberId}`);
                if (res.ok) {
                    return await res.json();
                }
            } catch (err) {
                console.warn("[LibraryAPI] Fetch account from server failed:", err.message);
            }
        }
        return null;
    },

    // Renew Book
    async renewBook(memberId, bookId) {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/renew`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ memberId, bookId })
                });
                return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Server renew failed:", err.message);
            }
        }
        return null;
    },

    // Pay Fine
    async payFine(memberId) {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/pay-fine`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ memberId })
                });
                return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Server pay fine failed:", err.message);
            }
        }
        return null;
    },

    // Librarian: Get Members
    async getMembers() {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/librarian/members`);
                if (res.ok) return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Fetch members failed:", err.message);
            }
        }
        return typeof users !== "undefined" ? users : [];
    },

    // Librarian: Get Currently Issued Books
    async getIssuedBooks() {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/librarian/issued`);
                if (res.ok) return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Fetch issued books failed:", err.message);
            }
        }
        return typeof getAllIssuedBooks === "function" ? getAllIssuedBooks() : [];
    },

    // Librarian: Get Overdue Books
    async getOverdueBooks() {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/librarian/overdue`);
                if (res.ok) return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Fetch overdue books failed:", err.message);
            }
        }
        return typeof getOverdueBooks === "function" ? getOverdueBooks() : [];
    },

    // Librarian: Get All Transactions
    async getTransactions() {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/librarian/transactions`);
                if (res.ok) return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Fetch transactions failed:", err.message);
            }
        }
        return typeof transactions !== "undefined" ? transactions : [];
    },

    // Librarian: Add Book
    async addBook(bookData) {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/librarian/books`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bookData)
                });
                return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Add book failed:", err.message);
            }
        }
        return null;
    },

    // Librarian: Update Book
    async updateBook(bookId, bookData) {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/librarian/books/${bookId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bookData)
                });
                return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Update book failed:", err.message);
            }
        }
        return null;
    },

    // Librarian: Delete Book
    async deleteBook(bookId) {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/librarian/books/${bookId}`, {
                    method: "DELETE"
                });
                return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Delete book failed:", err.message);
            }
        }
        return null;
    },

    // Librarian: Add Member
    async addMember(memberData) {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/librarian/members`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(memberData)
                });
                return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Add member failed:", err.message);
            }
        }
        return null;
    },

    // Librarian: Get Reports
    async getReports() {
        const hasServer = await this.checkBackend();
        if (hasServer) {
            try {
                const res = await fetch(`${API_BASE}/api/librarian/reports`);
                if (res.ok) return await res.json();
            } catch (err) {
                console.warn("[LibraryAPI] Fetch reports failed:", err.message);
            }
        }
        return null;
    }
};

window.LibraryAPI = LibraryAPI;
