import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(4, "Min 4 characters").required("Password is required"),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export function useAuthViewModel() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = useCallback(
    async (data: LoginFormData) => {
      try {
        await login(data.email, data.password);
        navigate("/");
      } catch {
        // error is set in store
      }
    },
    [login, navigate]
  );

  return {
    form,
    isLoading,
    error,
    clearError,
    handleLogin,
  };
}
