const API_BASE = "http://localhost:3000/api";
// API Request
async function postRequest(endpoint, method = "GET", data) {
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
        throw new Error(result.message || "Request failed.");
    }
    return result;
}
// Get all posts
async function getAllPosts() {
    const result = await postRequest("/posts");
    return result.posts;
}
// Create post
async function createPost(title, content) {
    await postRequest("/posts", "POST", {
        title,
        content,
    });
}
// Update post
async function updatePost(id, title, content) {
    await postRequest(`/posts/${id}`, "PUT", {
        title,
        content,
    });
}
// Delete post
async function deletePost(id) {
    await postRequest(`/posts/${id}`, "DELETE");
}
// Initialize Posts UI
export async function initializePostsUI(currentUser) {
    const postsTableBody = document.querySelector("#posts-table-body");
    const postForm = document.querySelector("#post-form");
    const postTitle = document.querySelector("#post-title");
    const postContent = document.querySelector("#post-content");
    const formHeading = document.querySelector("#form-heading");
    const cancelButton = document.querySelector("#cancel-edit");
    const message = document.querySelector("#posts-message");
    if (!postsTableBody ||
        !postForm ||
        !postTitle ||
        !postContent ||
        !formHeading ||
        !cancelButton ||
        !message) {
        console.error("Posts UI elements were not found.");
        return;
    }
    let editingPostId = null;
    function showMessage(text, isError = false) {
        const messageElement = message;
        if (!messageElement) {
            console.error("Posts message element not found.");
            return;
        }
        messageElement.textContent = text;
        messageElement.style.color = isError ? "#dc2626" : "#15803d";
    }
    function resetForm() {
        if (!postForm || !formHeading || !cancelButton) {
            console.error("Post form elements not found.");
            return;
        }
        editingPostId = null;
        postForm.reset();
        formHeading.textContent = "Create New Post";
        cancelButton.hidden = true;
    }
    // Render posts table
    async function renderPosts() {
        try {
            if (!postsTableBody) {
                console.error("Posts table body not found.");
                return;
            }
            const posts = await getAllPosts();
            postsTableBody.replaceChildren();
            if (posts.length === 0) {
                const row = document.createElement("tr");
                const cell = document.createElement("td");
                cell.colSpan = 5;
                cell.textContent = "No posts found.";
                row.appendChild(cell);
                postsTableBody.appendChild(row);
                return;
            }
            posts.forEach((post) => {
                const row = document.createElement("tr");
                const idCell = document.createElement("td");
                idCell.textContent = String(post.id);
                const titleCell = document.createElement("td");
                titleCell.textContent = post.title;
                const contentCell = document.createElement("td");
                contentCell.textContent = post.content;
                const authorCell = document.createElement("td");
                authorCell.textContent = post.author;
                const actionCell = document.createElement("td");
                // Only the owner can edit their post.
                if (post.user_id === currentUser.id) {
                    const editButton = document.createElement("button");
                    editButton.type = "button";
                    editButton.className = "btn btn-sm btn-outline-primary";
                    editButton.innerHTML = `
  <i class="fa-solid fa-pen-to-square me-1"></i>
  Edit
`;
                    editButton.addEventListener("click", () => {
                        if (!postTitle ||
                            !postContent ||
                            !formHeading ||
                            !cancelButton ||
                            !postForm) {
                            console.error("Post edit form elements not found.");
                            return;
                        }
                        editingPostId = post.id;
                        postTitle.value = post.title;
                        postContent.value = post.content;
                        formHeading.textContent = "Edit Post";
                        cancelButton.hidden = false;
                        postForm.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });
                    });
                    actionCell.appendChild(editButton);
                }
                // Only Admin can delete posts.
                if (currentUser.role === "admin") {
                    const deleteButton = document.createElement("button");
                    deleteButton.type = "button";
                    deleteButton.className = "btn btn-sm btn-outline-danger";
                    deleteButton.innerHTML = `
  <i class="fa-solid fa-trash me-1"></i>
  Delete
`;
                    deleteButton.addEventListener("click", async () => {
                        const confirmed = window.confirm(`Are you sure you want to delete "${post.title}"?`);
                        if (!confirmed)
                            return;
                        try {
                            await deletePost(post.id);
                            showMessage("Post deleted successfully.");
                            await renderPosts();
                        }
                        catch (error) {
                            showMessage(error instanceof Error ? error.message : "Delete failed.", true);
                        }
                    });
                    actionCell.appendChild(deleteButton);
                }
                row.append(idCell, titleCell, contentCell, authorCell, actionCell);
                postsTableBody.appendChild(row);
            });
        }
        catch (error) {
            showMessage(error instanceof Error ? error.message : "Could not load posts.", true);
        }
    }
    // Create and Update
    postForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const title = postTitle.value.trim();
        const content = postContent.value.trim();
        if (!title || !content) {
            showMessage("Please enter title and content.", true);
            return;
        }
        try {
            if (editingPostId !== null) {
                await updatePost(editingPostId, title, content);
                showMessage("Post updated successfully.");
            }
            else {
                await createPost(title, content);
                showMessage("Post created successfully.");
            }
            resetForm();
            await renderPosts();
        }
        catch (error) {
            showMessage(error instanceof Error ? error.message : "Could not save post.", true);
        }
    });
    // Cancel editing
    cancelButton.addEventListener("click", () => {
        resetForm();
        showMessage("");
    });
    await renderPosts();
}
