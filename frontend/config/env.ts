import { z } from "zod";

/**
 * Environment variable schema with validation
 * This ensures all required environment variables are present and valid at runtime
 */
const envSchema = z.object({
  // API URLs
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:5000"),
  NEXT_PUBLIC_WS_URL: z.string().default("ws://localhost:1234"),
  NEXT_PUBLIC_SOCKETIO_URL: z.string().url().default("http://localhost:5000"),
  
  // App Configuration
  NEXT_PUBLIC_APP_NAME: z.string().default("Blog & Case Study Platform"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

/**
 * Validate and parse environment variables
 * Throws an error if validation fails
 */
const parseEnv = () => {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_SOCKETIO_URL: process.env.NEXT_PUBLIC_SOCKETIO_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
};

/**
 * Validated environment variables
 * Safe to use throughout the application
 */
export const env = parseEnv();

/**
 * Helper to get API endpoint URL
 */
export const getApiUrl = (path: string) => {
  const baseUrl = env.NEXT_PUBLIC_API_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Helper to get WebSocket URL
 */
export const getWsUrl = (documentId?: string) => {
  if (documentId) {
    return `${env.NEXT_PUBLIC_WS_URL}/${documentId}`;
  }
  return env.NEXT_PUBLIC_WS_URL;
};

/**
 * Helper to get Socket.IO URL
 */
export const getSocketIOUrl = () => {
  return env.NEXT_PUBLIC_SOCKETIO_URL;
};

/**
 * Check if running in development mode
 */
export const isDev = process.env.NODE_ENV === "development";

/**
 * Check if running in production mode
 */
export const isProd = process.env.NODE_ENV === "production";

/**
 * Check if running in test mode
 */
export const isTest = process.env.NODE_ENV === "test";

