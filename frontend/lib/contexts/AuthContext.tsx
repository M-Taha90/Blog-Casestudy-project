"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import type { LoginInput, RegisterInput, AuthResponse } from "@/types/api";
import type { User } from "@/types/models";
import { STORAGE_KEYS, ROUTES } from "@/lib/constants";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Load user and token from localStorage on mount
   */
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        // Clear invalid data
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
    }

    setIsLoading(false);
  }, []);

  /**
   * Save auth data to state and localStorage
   */
  const saveAuthData = useCallback((authResponse: AuthResponse) => {
    const { token, user } = authResponse;
    
    // Save to state
    setToken(token);
    setUser(user as User);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }, []);

  /**
   * Clear auth data from state and localStorage
   */
  const clearAuthData = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }, []);

  /**
   * Login user
   */
  const login = useCallback(
    async (data: LoginInput) => {
      try {
        const response = await authApi.login(data);
        saveAuthData(response);
        router.push(ROUTES.POSTS);
      } catch (error) {
        // Error is handled by API client interceptor
        throw error;
      }
    },
    [saveAuthData, router]
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (data: RegisterInput) => {
      try {
        const response = await authApi.register(data);
        saveAuthData(response);
        router.push(ROUTES.POSTS);
      } catch (error) {
        // Error is handled by API client interceptor
        throw error;
      }
    },
    [saveAuthData, router]
  );

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    clearAuthData();
    router.push(ROUTES.LOGIN);
  }, [clearAuthData, router]);

  /**
   * Refresh user data from localStorage
   * Useful after external updates
   */
  const refreshUser = useCallback(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
      }
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

