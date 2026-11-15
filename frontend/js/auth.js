const API_BASE = "http://localhost:3000/api";
async function apiRequest(endpoint, method = "GET", data) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Something went wrong.");
    }
    return result;
}
// Login
const loginForm = document.querySelector("#login-form");
loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document
        .querySelector("#login-email")
        .value.trim();
    const password = document.querySelector("#login-password").value;
    const message = document.querySelector("#message");
    try {
        const result = await apiRequest("/auth/login", "POST", {
            email,
            password,
        });
        message.textContent = result.message || "Login successful.";
        window.location.href = "index.html";
    }
    catch (error) {
        message.textContent =
            error instanceof Error ? error.message : "Login failed.";
    }
});
// Signup
const signupForm = document.querySelector("#signup-form");
signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document
        .querySelector("#signup-username")
        .value.trim();
    const email = document
        .querySelector("#signup-email")
        .value.trim();
    const password = document.querySelector("#signup-password").value;
    const message = document.querySelector("#message");
    try {
        const result = await apiRequest("/auth/signup", "POST", {
            username,
            email,
            password,
        });
        message.textContent = result.message || "Account created successfully.";
        window.location.href = "login.html";
    }
    catch (error) {
        message.textContent =
            error instanceof Error ? error.message : "Signup failed.";
    }
});
// Get current logged-in user
export async function getCurrentUser() {
    try {
        const result = await apiRequest("/auth/me");
        return result.user;
    }
    catch {
        return null;
    }
}
// Logout
export async function logout() {
    await apiRequest("/auth/logout", "POST");
    window.location.href = "login.html";
}
