import type { AuthResponse, LoginCredentials, User } from "@/models/User";
import { TOKEN_KEY } from "@/constants";

// Mock user for demo
const MOCK_USER: User = {
  id: "1",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
  status: "active",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));

    if (credentials.email === "admin@example.com" && credentials.password === "password") {
      const response: AuthResponse = {
        token: "mock-jwt-token-" + Date.now(),
        user: MOCK_USER,
      };
      localStorage.setItem(TOKEN_KEY, response.token);
      return response;
    }

    throw new Error("Invalid email or password");
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  async getCurrentUser(): Promise<User> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_USER;
  },
};
