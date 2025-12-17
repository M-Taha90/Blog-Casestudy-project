import { post } from "./client";
import type {
  RegisterInput,
  LoginInput,
  AuthResponse,
} from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Auth API functions
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    return post<AuthResponse, RegisterInput>(API_ENDPOINTS.AUTH_REGISTER, data);
  },

  /**
   * Login user
   */
  login: async (data: LoginInput): Promise<AuthResponse> => {
    return post<AuthResponse, LoginInput>(API_ENDPOINTS.AUTH_LOGIN, data);
  },
};

