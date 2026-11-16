import { requireAuth, logout } from "./auth.js";
import { initializePostsUI } from "./posts.js";
async function initializeApp() {
    try {
        const user = await requireAuth();
        const usernameElement = document.querySelector("#current-username");
        const roleElement = document.querySelector("#current-role");
        const logoutButton = document.querySelector("#logout-button");
        if (usernameElement) {
            usernameElement.textContent = user.username;
        }
        if (roleElement) {
            roleElement.textContent = user.role;
        }
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
        await initializePostsUI(user);
    }
    catch (error) {
        console.error("Application initialization failed:", error);
    }
}
// Recheck authentication when the page is restored
// through the browser Back/Forward button.
// Recheck authentication whenever Dashboard is restored.
window.addEventListener("pageshow", async () => {
    try {
        await requireAuth();
    }
    catch (error) {
        console.error("Authentication check failed:", error);
    }
});
void initializeApp();
