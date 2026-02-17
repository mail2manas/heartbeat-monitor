import type { User } from "@/models/User";

const MOCK_USERS: User[] = Array.from({ length: 35 }, (_, i) => ({
  id: String(i + 1),
  name: [
    "Sarah Chen", "Mike Johnson", "Emily Davis", "Alex Rivera", "Jordan Lee",
    "Taylor Kim", "Morgan Smith", "Casey Brown", "Jamie Wilson", "Riley Garcia",
  ][i % 10],
  email: `user${i + 1}@example.com`,
  role: (["admin", "editor", "viewer"] as const)[i % 3],
  status: (["active", "inactive"] as const)[i % 5 === 0 ? 1 : 0],
  createdAt: new Date(2024, 0, i + 1).toISOString(),
  updatedAt: new Date(2024, 6, i + 1).toISOString(),
}));

export interface UserListParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const userService = {
  async getUsers(params: UserListParams): Promise<PaginatedResponse<User>> {
    await new Promise((r) => setTimeout(r, 400));

    let filtered = [...MOCK_USERS];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (params.role) filtered = filtered.filter((u) => u.role === params.role);
    if (params.status) filtered = filtered.filter((u) => u.status === params.status);

    const start = (params.page - 1) * params.pageSize;
    return {
      data: filtered.slice(start, start + params.pageSize),
      total: filtered.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },

  async createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    await new Promise((r) => setTimeout(r, 500));
    return {
      ...user,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    await new Promise((r) => setTimeout(r, 500));
    const existing = MOCK_USERS.find((u) => u.id === id);
    if (!existing) throw new Error("User not found");
    return { ...existing, ...user, updatedAt: new Date().toISOString() };
  },

  async deleteUser(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 400));
    const idx = MOCK_USERS.findIndex((u) => u.id === id);
    if (idx !== -1) MOCK_USERS.splice(idx, 1);
  },
};
