import { api } from "@/lib/axios";
import type { AuthResponse } from "@/types/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await api.post<AuthResponse>("/auth/login", payload);
    return response.data;
  },

  signup: async (payload: SignupPayload) => {
    const response = await api.post<AuthResponse>("/auth/signup", payload);
    return response.data;
  },
};
