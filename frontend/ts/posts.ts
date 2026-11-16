const API_BASE = "http://localhost:3000/api";

export interface Post {
  id: number;
  user_id: number | null;
  title: string;
  content: string;
  author: string;
  created_at?: string;
  updated_at?: string;
}

interface PostsResponse {
  posts: Post[];
}

interface PostResponse {
  message?: string;
  post?: Post;
}

interface CurrentUser {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
}

// API Request
async function postRequest<T>(
  endpoint: string,
  method: string = "GET",
  data?: unknown,
): Promise<T> {
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

  return result as T;
}

// Get all posts
async function getAllPosts(): Promise<Post[]> {
  const result = await postRequest<PostsResponse>("/posts");
  return result.posts;
}

// Create post
async function createPost(title: string, content: string): Promise<void> {
  await postRequest<PostResponse>("/posts", "POST", {
    title,
    content,
  });
}

// Update post
async function updatePost(
  id: number,
  title: string,
  content: string,
): Promise<void> {
  await postRequest<PostResponse>(`/posts/${id}`, "PUT", {
    title,
    content,
  });
}

// Delete post
async function deletePost(id: number): Promise<void> {
  await postRequest<PostResponse>(`/posts/${id}`, "DELETE");
}

// Initialize Posts UI
export async function initializePostsUI(
  currentUser: CurrentUser,
): Promise<void> {
  const postsTableBody =
    document.querySelector<HTMLTableSectionElement>("#posts-table-body");

  const postForm = document.querySelector<HTMLFormElement>("#post-form");

  const postTitle = document.querySelector<HTMLInputElement>("#post-title");

  const postContent =
    document.querySelector<HTMLTextAreaElement>("#post-content");

  const formHeading = document.querySelector<HTMLElement>("#form-heading");

  const cancelButton =
    document.querySelector<HTMLButtonElement>("#cancel-edit");

  const message = document.querySelector<HTMLElement>("#posts-message");

  if (
    !postsTableBody ||
    !postForm ||
    !postTitle ||
    !postContent ||
    !formHeading ||
    !cancelButton ||
    !message
  ) {
    console.error("Posts UI elements were not found.");
    return;
  }

  let editingPostId: number | null = null;

  function showMessage(text: string, isError = false): void {
    const messageElement = message;

    if (!messageElement) {
      console.error("Posts message element not found.");
      return;
    }

    messageElement.textContent = text;
    messageElement.style.color = isError ? "#dc2626" : "#15803d";
  }

  function resetForm(): void {
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
  async function renderPosts(): Promise<void> {
    try {
      if (!postsTableBody) {
        console.error("Posts table body not found.");
        return;
      }

      const posts = await getAllPosts();

      postsTableBody.replaceChildren();

      if (posts.length === 0) {
        const row = document.createElement("tr");
        row.className = "border-t border-slate-100";

        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.className = "px-6 py-10 text-center text-sm text-slate-400";
        cell.textContent = "No posts found.";

        row.appendChild(cell);
        postsTableBody.appendChild(row);
        return;
      }

      posts.forEach((post) => {
        const row = document.createElement("tr");

        row.className =
          "border-t border-slate-100 transition hover:bg-slate-50";

        const idCell = document.createElement("td");
        idCell.textContent = String(post.id);
        idCell.className = "whitespace-nowrap px-6 py-4 text-sm text-slate-500";

        const titleCell = document.createElement("td");
        titleCell.textContent = post.title;
        titleCell.className =
          "max-w-xs px-6 py-4 text-sm font-semibold text-slate-800 break-words";

        const contentCell = document.createElement("td");
        contentCell.textContent = post.content;
        contentCell.className =
          "max-w-md px-6 py-4 text-sm leading-6 text-slate-600 break-words";

        const authorCell = document.createElement("td");
        authorCell.textContent = post.author;
        authorCell.className =
          "whitespace-nowrap px-6 py-4 text-sm text-slate-600";

        const actionCell = document.createElement("td");
        actionCell.className = "whitespace-nowrap px-6 py-4 text-sm";

        // Only the owner can edit their post.
        if (post.user_id === currentUser.id) {
          const editButton = document.createElement("button");

          editButton.type = "button";
          editButton.textContent = "Edit";
          editButton.className =
            "inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

          editButton.addEventListener("click", () => {
            if (
              !postTitle ||
              !postContent ||
              !formHeading ||
              !cancelButton ||
              !postForm
            ) {
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
          deleteButton.textContent = "Delete";
          deleteButton.className =
            "ml-2 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/20";

          deleteButton.addEventListener("click", async () => {
            const confirmed = window.confirm(
              `Are you sure you want to delete "${post.title}"?`,
            );

            if (!confirmed) return;

            try {
              await deletePost(post.id);
              showMessage("Post deleted successfully.");
              await renderPosts();
            } catch (error) {
              showMessage(
                error instanceof Error ? error.message : "Delete failed.",
                true,
              );
            }
          });

          actionCell.appendChild(deleteButton);
        }

        row.append(idCell, titleCell, contentCell, authorCell, actionCell);

        postsTableBody.appendChild(row);
      });
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Could not load posts.",
        true,
      );
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
      } else {
        await createPost(title, content);
        showMessage("Post created successfully.");
      }

      resetForm();
      await renderPosts();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Could not save post.",
        true,
      );
    }
  });

  // Cancel editing
  cancelButton.addEventListener("click", () => {
    resetForm();
    showMessage("");
  });

  await renderPosts();
}
