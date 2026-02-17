import { useState, useEffect, useCallback } from "react";
import type { User } from "@/models/User";
import { userService, type UserListParams, type PaginatedResponse } from "@/services/userService";
import { PAGINATION } from "@/constants";

export function useUserViewModel() {
  const [data, setData] = useState<PaginatedResponse<User>>({
    data: [], total: 0, page: 1, pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION.DEFAULT_PAGE_SIZE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: UserListParams = { page, pageSize, search, role: roleFilter || undefined, status: statusFilter || undefined };
      const result = await userService.getUsers(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const createUser = useCallback(async (user: Omit<User, "id" | "createdAt" | "updatedAt">) => {
    setIsSubmitting(true);
    try {
      await userService.createUser(user);
      await fetchUsers();
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: string, user: Partial<User>) => {
    setIsSubmitting(true);
    try {
      await userService.updateUser(id, user);
      await fetchUsers();
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      await userService.deleteUser(id);
      await fetchUsers();
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchUsers]);

  const totalPages = Math.ceil(data.total / pageSize);

  return {
    users: data.data, total: data.total, page, pageSize, totalPages,
    search, roleFilter, statusFilter,
    isLoading, error, isSubmitting,
    setSearch, setRoleFilter, setStatusFilter, setPage, setPageSize,
    createUser, updateUser, deleteUser, refetch: fetchUsers,
  };
}
