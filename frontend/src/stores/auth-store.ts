import { create } from "zustand";
import type { User } from "@/lib/types";
import api from "@/lib/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const { data } = await api.post("/api/v1/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    const me = await api.get("/api/v1/auth/me");
    set({ user: me.data, loading: false });
  },

  register: async (name, email, password) => {
    const { data } = await api.post("/api/v1/auth/register", {
      name,
      email,
      password,
    });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    const me = await api.get("/api/v1/auth/me");
    set({ user: me.data, loading: false });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, loading: false });
    window.location.href = "/login";
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        set({ user: null, loading: false });
        return;
      }
      const { data } = await api.get("/api/v1/auth/me");
      set({ user: data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
