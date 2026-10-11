// ============================================================
// Authentication Module
// Handles login, logout, and session management using
// localStorage. In production, this will be replaced by
// server-side session management with the DBMS.
// ============================================================

const AUTH_KEY = "library_current_user";

// Login: validate credentials against mock user data
function loginUser(userId, password, userType) {
    const input = String(userId || '').trim().toLowerCase();
    const user = users.find(u =>
        (String(u.user_id || '').toLowerCase() === input ||
         String(u.email || '').toLowerCase() === input ||
         String(u.name || '').toLowerCase() === input ||
         (input === 'librarian' && u.user_type === 'Librarian') ||
         (input === 'admin' && u.user_type === 'Librarian')) &&
        u.password === password &&
        (!userType || u.user_type === userType)
    );

    if (user) {
        // Store user session (exclude password)
        const session = {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            department: user.department,
            user_type: user.user_type
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        return { success: true, user: session };
    }

    return { success: false, message: "Invalid credentials. Please check your User ID, Password, and User Type." };
}

// Logout: clear session
function logoutUser() {
    localStorage.removeItem(AUTH_KEY);
}

// Get current logged-in user
function getCurrentUser() {
    const data = localStorage.getItem(AUTH_KEY);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Check if current user is a librarian
function isLibrarian() {
    const user = getCurrentUser();
    return user && user.user_type === "Librarian";
}

// Update navigation based on login state
function updateNavForAuth() {
    const user = getCurrentUser();
    const loginLinks = document.querySelectorAll(".nav-login-link");
    const accountLinks = document.querySelectorAll(".nav-account-link");
    const logoutLinks = document.querySelectorAll(".nav-logout-link");
    const librarianLinks = document.querySelectorAll(".nav-librarian-link");
    const userNameDisplays = document.querySelectorAll(".nav-user-name");

    if (user) {
        loginLinks.forEach(el => el.style.display = "none");
        logoutLinks.forEach(el => el.style.display = "");
        userNameDisplays.forEach(el => el.textContent = user.name);

        if (user.user_type === "Librarian") {
            // For Librarian: hide account section/links, show dashboard
            accountLinks.forEach(el => {
                const isLogout = el.classList.contains("nav-logout-link") ||
                    el.querySelector("a[onclick*='logoutUser']") ||
                    (el.tagName === "A" && el.getAttribute("onclick") && el.getAttribute("onclick").includes("logoutUser"));
                if (isLogout) {
                    el.style.display = "";
                } else {
                    el.style.display = "none";
                }
            });
            librarianLinks.forEach(el => el.style.display = "");

            // Hide quick link to account on homepage if present
            document.querySelectorAll(".quick-links a[href*='account.html']").forEach(link => {
                link.style.display = "none";
            });
        } else {
            // For regular members: show account, hide dashboard
            accountLinks.forEach(el => el.style.display = "");
            librarianLinks.forEach(el => el.style.display = "none");

            document.querySelectorAll(".quick-links a[href*='account.html']").forEach(link => {
                link.style.display = "";
            });
        }
    } else {
        loginLinks.forEach(el => el.style.display = "");
        accountLinks.forEach(el => el.style.display = "none");
        logoutLinks.forEach(el => el.style.display = "none");
        librarianLinks.forEach(el => el.style.display = "none");

        document.querySelectorAll(".quick-links a[href*='account.html']").forEach(link => {
            link.style.display = "";
        });
    }
}
