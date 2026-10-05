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
                    const booksData = await res.json();
                    return booksData;
                }
            } catch (err) {
                console.warn("[LibraryAPI] Fetch books from server failed:", err.message);
            }
        }
        return typeof books !== "undefined" ? books : [];
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
    }
};

window.LibraryAPI = LibraryAPI;
