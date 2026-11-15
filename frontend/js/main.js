import { requireAuth, logout } from "./auth.js";
async function initializeApp() {
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
            alert(error instanceof Error ? error.message : "Logout failed.");
            logoutButton.disabled = false;
        }
    });
}
void initializeApp();
