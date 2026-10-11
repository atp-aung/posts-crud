interface Post {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

const API_URL = "http://localhost:3000/api/posts";

const form = document.querySelector<HTMLFormElement>("#post-form")!;
const titleInput = document.querySelector<HTMLInputElement>("#title")!;
const contentInput = document.querySelector<HTMLTextAreaElement>("#content")!;
const submitButton = document.querySelector<HTMLButtonElement>("#submit-btn")!;
const cancelButton = document.querySelector<HTMLButtonElement>("#cancel-btn")!;
const postsContainer = document.querySelector<HTMLDivElement>("#posts")!;
const message = document.querySelector<HTMLParagraphElement>("#message")!;

let editingId: number | null = null;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
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

  return data as T;
}

function showMessage(text: string): void {
  message.textContent = text;
}

function renderPosts(posts: Post[]): void {
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
      if (!confirm(`Delete "${post.title}"?`)) return;

      try {
        await request<{ message: string }>(`${API_URL}/${post.id}`, {
          method: "DELETE",
        });

        showMessage("Post deleted successfully.");
        await loadPosts();
      } catch (error) {
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

async function loadPosts(): Promise<void> {
  try {
    const posts = await request<Post[]>(API_URL);
    renderPosts(posts);
  } catch (error) {
    showMessage(
      error instanceof Error ? error.message : "Failed to load posts",
    );
  }
}

function resetForm(): void {
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
    } else {
      await request(`${API_URL}/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({ title, content }),
      });

      showMessage("Post updated successfully.");
    }

    resetForm();
    await loadPosts();
  } catch (error) {
    showMessage(error instanceof Error ? error.message : "Save failed");
  }
});

cancelButton.addEventListener("click", () => {
  resetForm();
  showMessage("");
});

loadPosts();
