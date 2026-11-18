import { requireAuth, logout, changePassword } from "./auth.js";
import { initializePostsUI } from "./posts.js";
import { getAllUsers, renderUsers } from "./users.js";

async function initializeApp(): Promise<void> {
  try {
    const user = await requireAuth();

    const usernameElement =
      document.querySelector<HTMLElement>("#current-username");

    const roleElement = document.querySelector<HTMLElement>("#current-role");

    const logoutButton =
      document.querySelector<HTMLButtonElement>("#logout-button");

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
      } catch (error) {
        logoutButton.disabled = false;

        alert(error instanceof Error ? error.message : "Logout failed.");
      }
    });
    const changePasswordForm = document.querySelector<HTMLFormElement>(
      "#change-password-form",
    );

    const currentPasswordInput =
      document.querySelector<HTMLInputElement>("#current-password");

    const newPasswordInput =
      document.querySelector<HTMLInputElement>("#new-password");

    const confirmPasswordInput =
      document.querySelector<HTMLInputElement>("#confirm-password");

    const passwordMessage =
      document.querySelector<HTMLElement>("#password-message");

    changePasswordForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (
        !currentPasswordInput ||
        !newPasswordInput ||
        !confirmPasswordInput ||
        !passwordMessage
      ) {
        return;
      }

      const currentPassword = currentPasswordInput.value;
      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      passwordMessage.textContent = "";
      passwordMessage.className = "mb-3 small";

      if (newPassword.length < 8) {
        passwordMessage.textContent =
          "New password must be at least 8 characters.";

        passwordMessage.classList.add("text-danger");
        return;
      }

      if (newPassword !== confirmPassword) {
        passwordMessage.textContent =
          "New password and confirm password do not match.";

        passwordMessage.classList.add("text-danger");
        return;
      }

      if (currentPassword === newPassword) {
        passwordMessage.textContent =
          "New password must be different from current password.";

        passwordMessage.classList.add("text-danger");
        return;
      }

      const submitButton = changePasswordForm.querySelector<HTMLButtonElement>(
        'button[type="submit"]',
      );

      if (submitButton) {
        submitButton.disabled = true;
      }

      try {
        const message = await changePassword(currentPassword, newPassword);

        passwordMessage.textContent = message;
        passwordMessage.classList.add("text-success");

        changePasswordForm.reset();
      } catch (error) {
        passwordMessage.textContent =
          error instanceof Error ? error.message : "Could not change password.";

        passwordMessage.classList.add("text-danger");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });

    // Initialize Posts UI
    await initializePostsUI(user);

    // Admin User Management
    if (user.role === "admin") {
      const userManagementNav = document.querySelector<HTMLElement>(
        "#user-management-nav",
      );

      const userManagementSection =
        document.querySelector<HTMLElement>("#user-management");

      const refreshUsersButton =
        document.querySelector<HTMLButtonElement>("#refresh-users");

      const usersMessage =
        document.querySelector<HTMLElement>("#users-message");

      // Show User Management menu
      userManagementNav?.classList.remove("d-none");

      // Load Users
      async function loadUsers(): Promise<void> {
        if (!usersMessage) return;

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
        } catch (error) {
          usersMessage.textContent =
            error instanceof Error ? error.message : "Failed to load users.";

          usersMessage.className = "small text-danger";
        } finally {
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
  } catch (error) {
    console.error("Application initialization failed:", error);
  }
}

// Recheck authentication when the page is restored
// through the browser Back/Forward button.
window.addEventListener("pageshow", async () => {
  try {
    await requireAuth();
  } catch (error) {
    console.error("Authentication check failed:", error);
  }
});

void initializeApp();
