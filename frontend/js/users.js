const API_BASE = "http://localhost:3000/api";
// API Request
async function apiRequest(endpoint, method = "GET") {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Something went wrong.");
    }
    return result;
}
// Get All Users
export async function getAllUsers() {
    const result = await apiRequest("/users");
    return result.users;
}
// Get User By ID
export async function getUserById(id) {
    const result = await apiRequest(`/users/${id}`);
    return result.user;
}
// Delete User
export async function deleteUser(id) {
    const result = await apiRequest(`/users/${id}`, "DELETE");
    return result.message;
}
// Render Users Table
export function renderUsers(users, currentUserId) {
    const tableBody = document.querySelector("#users-table-body");
    const usersMessage = document.querySelector("#users-message");
    if (!tableBody)
        return;
    tableBody.innerHTML = "";
    if (users.length === 0) {
        tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          No users found.
        </td>
      </tr>
    `;
        return;
    }
    users.forEach((user) => {
        const row = document.createElement("tr");
        // User ID
        const idCell = document.createElement("td");
        idCell.textContent = String(user.id);
        // Username
        const usernameCell = document.createElement("td");
        usernameCell.textContent = user.username;
        // Email
        const emailCell = document.createElement("td");
        emailCell.textContent = user.email;
        // Role
        const roleCell = document.createElement("td");
        const roleBadge = document.createElement("span");
        roleBadge.className =
            user.role === "admin" ? "badge bg-primary" : "badge bg-secondary";
        roleBadge.textContent = user.role;
        roleCell.appendChild(roleBadge);
        // Created Date
        const dateCell = document.createElement("td");
        const createdDate = new Date(user.created_at);
        dateCell.textContent = Number.isNaN(createdDate.getTime())
            ? "Invalid date"
            : createdDate.toLocaleDateString();
        // Actions
        const actionsCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-sm btn-outline-danger";
        if (user.id === currentUserId) {
            deleteButton.disabled = true;
            deleteButton.title = "You cannot delete your own account.";
            deleteButton.innerHTML = `
        <i class="fa-solid fa-lock me-1"></i>
        Current Account
      `;
        }
        else {
            deleteButton.innerHTML = `
        <i class="fa-solid fa-trash me-1"></i>
        Delete
      `;
            deleteButton.addEventListener("click", async () => {
                const confirmed = window.confirm(`Are you sure you want to delete "${user.username}"?\n\nTheir posts will be preserved.`);
                if (!confirmed)
                    return;
                deleteButton.disabled = true;
                try {
                    const message = await deleteUser(user.id);
                    if (usersMessage) {
                        usersMessage.textContent = message;
                        usersMessage.className = "small text-success";
                    }
                    // Reload Users List
                    const updatedUsers = await getAllUsers();
                    renderUsers(updatedUsers, currentUserId);
                }
                catch (error) {
                    if (usersMessage) {
                        usersMessage.textContent =
                            error instanceof Error ? error.message : "Failed to delete user.";
                        usersMessage.className = "small text-danger";
                    }
                    deleteButton.disabled = false;
                }
            });
        }
        actionsCell.appendChild(deleteButton);
        row.append(idCell, usernameCell, emailCell, roleCell, dateCell, actionsCell);
        tableBody.appendChild(row);
    });
}
