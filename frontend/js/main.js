import { requireAuth, logout } from "./auth.js";
import { initializePostsUI } from "./posts.js";
import { getAllUsers, renderUsers } from "./users.js";
async function initializeApp() {
    try {
        const user = await requireAuth();
        const usernameElement = document.querySelector("#current-username");
        const roleElement = document.querySelector("#current-role");
        const logoutButton = document.querySelector("#logout-button");
        // Display current user information
        if (usernameElement) {
            usernameElement.textContent = user.username;
        }
        if (roleElement) {
            roleElement.textContent = user.role;
        }
        // Logout
        logoutButton?.addEventListener("click", async () => {
            logoutButton.disabled = true;
            try {
                await logout();
            }
            catch (error) {
                logoutButton.disabled = false;
                alert(error instanceof Error ? error.message : "Logout failed.");
            }
        });
        // Initialize Posts UI
        await initializePostsUI(user);
        // Admin User Management
        if (user.role === "admin") {
            const userManagementNav = document.querySelector("#user-management-nav");
            const userManagementSection = document.querySelector("#user-management");
            const refreshUsersButton = document.querySelector("#refresh-users");
            const usersMessage = document.querySelector("#users-message");
            // Show User Management menu
            userManagementNav?.classList.remove("d-none");
            // Load Users
            async function loadUsers() {
                if (!usersMessage)
                    return;
                usersMessage.textContent = "Loading users...";
                usersMessage.className = "small text-secondary";
                if (refreshUsersButton) {
                    refreshUsersButton.disabled = true;
                }
                try {
                    const users = await getAllUsers();
                    renderUsers(users, user.id);
                    usersMessage.textContent = `${users.length} user(s) found.`;
                    usersMessage.className = "small text-success";
                }
                catch (error) {
                    usersMessage.textContent =
                        error instanceof Error ? error.message : "Failed to load users.";
                    usersMessage.className = "small text-danger";
                }
                finally {
                    if (refreshUsersButton) {
                        refreshUsersButton.disabled = false;
                    }
                }
            }
            // Load users when clicking User Management
            userManagementNav?.addEventListener("click", async () => {
                userManagementSection?.classList.remove("d-none");
                await loadUsers();
            });
            // Refresh Users
            refreshUsersButton?.addEventListener("click", async () => {
                await loadUsers();
            });
        }
    }
    catch (error) {
        console.error("Application initialization failed:", error);
    }
}
// Recheck authentication when the page is restored
// through the browser Back/Forward button.
window.addEventListener("pageshow", async () => {
    try {
        await requireAuth();
    }
    catch (error) {
        console.error("Authentication check failed:", error);
    }
});
void initializeApp();
