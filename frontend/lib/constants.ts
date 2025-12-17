// Application constants

export const APP_NAME = "Blog & Case Study Platform";

// Post Types
export const POST_TYPES = {
  BLOG: "BLOG",
  CASE_STUDY: "CASE_STUDY",
} as const;

export const POST_TYPE_LABELS = {
  BLOG: "Blog",
  CASE_STUDY: "Case Study",
} as const;

// Post Status
export const POST_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export const POST_STATUS_LABELS = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
} as const;

export const POST_STATUS_COLORS = {
  DRAFT: "gray",
  PUBLISHED: "green",
} as const;

// Collaboration Roles
export const COLLAB_ROLES = {
  OWNER: "OWNER",
  EDITOR: "EDITOR",
  COMMENTER: "COMMENTER",
  VIEWER: "VIEWER",
} as const;

export const COLLAB_ROLE_LABELS = {
  OWNER: "Owner",
  EDITOR: "Editor",
  COMMENTER: "Commenter",
  VIEWER: "Viewer",
} as const;

// Collaboration Limits
export const COLLAB_LIMITS = {
  BLOG: 5,
  CASE_STUDY: 4,
} as const;

// Image Upload
export const IMAGE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
} as const;

// Editor Configuration
export const EDITOR_CONFIG = {
  AUTO_SAVE_DELAY: 2000, // 2 seconds
  SYNC_CHECK_INTERVAL: 3000, // 3 seconds
  RECONNECT_DELAY: 1000, // 1 second
  MAX_RECONNECT_ATTEMPTS: 5,
} as const;

// User Colors for Collaboration (used for cursor colors)
export const USER_COLORS = [
  "#2563eb", // blue
  "#dc2626", // red
  "#16a34a", // green
  "#9333ea", // purple
  "#ea580c", // orange
  "#0891b2", // cyan
  "#ca8a04", // yellow
  "#db2777", // pink
] as const;

// Validation Constraints
export const VALIDATION = {
  POST_TITLE_MIN: 3,
  POST_TITLE_MAX: 200,
  USER_NAME_MIN: 2,
  USER_NAME_MAX: 50,
  EMAIL_MAX: 100,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 100,
  INVITE_EXPIRY_DAYS: 7,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "token",
  USER_DATA: "user",
  THEME: "theme",
  EDITOR_PREFS: "editor_preferences",
} as const;

// API Endpoints (relative paths)
export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: "/api/auth/register",
  AUTH_LOGIN: "/api/auth/login",
  
  // Posts
  POSTS_LIST: "/api/posts",
  POSTS_BY_ID: (id: string) => `/api/posts/id/${id}`,
  POSTS_BY_SLUG: (slug: string) => `/api/posts/${slug}`,
  POSTS_UPDATE: (id: string) => `/api/posts/${id}`,
  POSTS_PUBLISH: (id: string) => `/api/posts/${id}/publish`,
  
  // Invites
  INVITES_CREATE: "/api/invites",
  INVITES_CHECK: (token: string) => `/api/invites/${token}`,
  INVITES_ACCEPT: (token: string) => `/api/invites/accept/${token}`,
  
  // Uploads
  UPLOADS: "/api/uploads",
  
  // AI
  AI_GENERATE: "/api/ai/generate",
  AI_MODELS: "/api/ai/models",
} as const;

// Socket.IO Events
export const SOCKET_EVENTS = {
  POSTS_UPDATE: "posts:update",
  POST_CONTENT_UPDATED: "post:content-updated",
  POST_COLLABORATOR_JOINED: "post:collaborator-joined",
  POST_COLLABORATOR_LEFT: "post:collaborator-left",
} as const;

// Route Paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  POSTS: "/posts",
  POST_EDIT: (id: string) => `/posts/${id}`,
  TEST_COLLAB: "/test-collab",
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  SAVE: "Ctrl+S",
  BOLD: "Ctrl+B",
  ITALIC: "Ctrl+I",
  UNDERLINE: "Ctrl+U",
  CODE: "Ctrl+`",
} as const;

