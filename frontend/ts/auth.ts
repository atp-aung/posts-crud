const API_BASE = "http://localhost:3000/api";

interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
}

interface AuthResponse {
  message?: string;
  user?: AuthUser;
}

async function apiRequest<T>(
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
    throw new Error(result.message || "Something went wrong.");
  }

  return result as T;
}

// Login
const loginForm = document.querySelector<HTMLFormElement>("#login-form");

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document
    .querySelector<HTMLInputElement>("#login-email")!
    .value.trim();

  const password =
    document.querySelector<HTMLInputElement>("#login-password")!.value;

  const message = document.querySelector<HTMLElement>("#message")!;

  try {
    const result = await apiRequest<AuthResponse>("/auth/login", "POST", {
      email,
      password,
    });

    message.textContent = result.message || "Login successful.";

    window.location.href = "index.html";
  } catch (error) {
    message.textContent =
      error instanceof Error ? error.message : "Login failed.";
  }
});

// Signup
const signupForm = document.querySelector<HTMLFormElement>("#signup-form");

signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document
    .querySelector<HTMLInputElement>("#signup-username")!
    .value.trim();

  const email = document
    .querySelector<HTMLInputElement>("#signup-email")!
    .value.trim();

  const password =
    document.querySelector<HTMLInputElement>("#signup-password")!.value;

  const message = document.querySelector<HTMLElement>("#message")!;

  try {
    const result = await apiRequest<AuthResponse>("/auth/signup", "POST", {
      username,
      email,
      password,
    });

    message.textContent = result.message || "Account created successfully.";

    window.location.href = "login.html";
  } catch (error) {
    message.textContent =
      error instanceof Error ? error.message : "Signup failed.";
  }
});

// Get current logged-in user
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const result = await apiRequest<{ user: AuthUser }>("/auth/me");
    return result.user;
  } catch {
    return null;
  }
}

// Logout
export async function logout(): Promise<void> {
  await apiRequest("/auth/logout", "POST");
  window.location.href = "login.html";
}
