export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.example.com";

export const TOKEN_KEY = "auth_token";

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
  USERS: "/users",
  NOT_FOUND: "*",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;
