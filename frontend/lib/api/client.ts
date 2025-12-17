import axios, {type AxiosInstance, type AxiosRequestConfig, type AxiosError} from "axios";
import { env, isDev } from "@/config/env";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: AxiosError
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Create axios instance with base configuration
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
    timeout: 30000, // 30 seconds
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor: Add auth token
  instance.interceptors.request.use(
    (config) => {
      // Get token from localStorage
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request in development
      if (isDev) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
        });
      }

      return config;
    },
    (error) => {
      if (isDev) {
        console.error("[API Request Error]", error);
      }
      return Promise.reject(error);
    }
  );

  // Response interceptor: Handle errors
  instance.interceptors.response.use(
    (response) => {
      // Log response in development
      if (isDev) {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
        });
      }
      return response;
    },
    (error: AxiosError<{ message?: string; error?: string }>) => {
      // Extract error message
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred";
      
      const statusCode = error.response?.status;

      // Log error in development
      if (isDev) {
        console.error("[API Response Error]", {
          url: error.config?.url,
          status: statusCode,
          message,
          data: error.response?.data,
        });
      }

      // Handle specific status codes
      if (statusCode === 401) {
        // Unauthorized: Clear auth data and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          
          // Only redirect if not already on login/register page
          if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
            window.location.href = "/login";
          }
        }
      }

      // Return custom error
      return Promise.reject(new APIError(message, statusCode, error));
    }
  );

  return instance;
};

/**
 * Global axios instance
 */
export const apiClient = createAxiosInstance();

/**
 * Generic GET request
 */
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

/**
 * Generic POST request
 */
export async function post<T, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

/**
 * Generic PUT request
 */
export async function put<T, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

/**
 * Generic DELETE request
 */
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

/**
 * Upload file with FormData
 */
export async function uploadFile<T>(
  url: string,
  formData: FormData,
  onUploadProgress?: (progressEvent: any) => void
): Promise<T> {
  const response = await apiClient.post<T>(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
  return response.data;
}

