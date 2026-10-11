"use strict";
const API_URL = "http://localhost:3000/api/posts";
const form = document.querySelector("#post-form");
const titleInput = document.querySelector("#title");
const contentInput = document.querySelector("#content");
const submitButton = document.querySelector("#submit-btn");
const cancelButton = document.querySelector("#cancel-btn");
const postsContainer = document.querySelector("#posts");
const message = document.querySelector("#message");
let editingId = null;
async function request(url, options) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }
    return data;
}
function showMessage(text) {
    message.textContent = text;
}
function renderPosts(posts) {
    postsContainer.replaceChildren();
    if (posts.length === 0) {
        postsContainer.textContent = "No posts yet.";
        return;
    }
    for (const post of posts) {
        const card = document.createElement("article");
        card.className = "post-card";
        const heading = document.createElement("h3");
        heading.textContent = post.title;
        const content = document.createElement("p");
        content.textContent = post.content || "No content";
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.type = "button";
        editButton.addEventListener("click", () => {
            editingId = post.id;
            titleInput.value = post.title;
            contentInput.value = post.content || "";
            submitButton.textContent = "Update Post";
            cancelButton.hidden = false;
            showMessage(`Editing post #${post.id}`);
            titleInput.focus();
        });
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", async () => {
            if (!confirm(`Delete "${post.title}"?`))
                return;
            try {
                await request(`${API_URL}/${post.id}`, {
                    method: "DELETE",
                });
                showMessage("Post deleted successfully.");
                await loadPosts();
            }
            catch (error) {
                showMessage(error instanceof Error ? error.message : "Delete failed");
            }
        });
        const actions = document.createElement("div");
        actions.className = "actions";
        actions.append(editButton, deleteButton);
        card.append(heading, content, actions);
        postsContainer.append(card);
    }
}
async function loadPosts() {
    try {
        const posts = await request(API_URL);
        renderPosts(posts);
    }
    catch (error) {
        showMessage(error instanceof Error ? error.message : "Failed to load posts");
    }
}
function resetForm() {
    form.reset();
    editingId = null;
    submitButton.textContent = "Add Post";
    cancelButton.hidden = true;
}
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    if (!title) {
        showMessage("Please enter a title.");
        return;
    }
    try {
        if (editingId === null) {
            await request(API_URL, {
                method: "POST",
                body: JSON.stringify({ title, content }),
            });
            showMessage("Post created successfully.");
        }
        else {
            await request(`${API_URL}/${editingId}`, {
                method: "PUT",
                body: JSON.stringify({ title, content }),
            });
            showMessage("Post updated successfully.");
        }
        resetForm();
        await loadPosts();
    }
    catch (error) {
        showMessage(error instanceof Error ? error.message : "Save failed");
    }
});
cancelButton.addEventListener("click", () => {
    resetForm();
    showMessage("");
});
loadPosts();
