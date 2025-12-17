// API request and response type definitions
import type { User, Post, Invite, Image, PostType, PostStatus } from "./models";

// ============= Auth API Types =============

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    pic?: string;
  };
}

// ============= Post API Types =============

export interface CreatePostInput {
  title: string;
  type: PostType;
}

export interface UpdatePostInput {
  title?: string;
  content?: any;
  status?: PostStatus;
}

export interface PostResponse extends Post {}

export interface PostsListResponse extends Array<Post> {}

// ============= Invite API Types =============

export interface CreateInviteInput {
  postId: string;
  inviteeEmail?: string;
}

export interface CreateInviteResponse {
  ok: boolean;
  token: string;
}

export interface InviteCheckResponse {
  ok: boolean;
  invite: Invite & {
    post: Post;
    inviter: User;
  };
}

export interface AcceptInviteResponse {
  ok: boolean;
  message: string;
  postId: string;
}

// ============= Upload API Types =============

export interface UploadResponse {
  message: string;
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  dbRecord?: {
    id: string;
    url: string;
    postId?: string | null;
    createdAt: Date | string;
  };
  warning?: string;
}

// ============= AI API Types =============

export interface AIGenerateInput {
  postId?: string;
  brief: string;
  tone?: "professional" | "casual" | "technical";
  length?: "short" | "medium" | "long";
}

export interface AIGenerateResponse {
  ok: boolean;
  generatedText: string;
  model?: string;
}

export interface AIModelsResponse {
  apiKeySet: boolean;
  apiKeyPrefix: string;
  apiKeyLength: number;
  totalModels: number;
  usableModels: Array<{
    name: string;
    displayName: string;
    description: string;
  }>;
  allModels: Array<{
    name: string;
    displayName: string;
    supportedMethods: string[];
  }>;
  note: string;
}

// ============= Error Response Types =============

export interface APIError {
  message: string;
  error?: string;
  statusCode?: number;
}

