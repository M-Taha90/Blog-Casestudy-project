import { get, post, put } from "./client";
import type {
  Post,
  CreatePostInput,
  UpdatePostInput,
  PostResponse,
  PostsListResponse,
} from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Posts API functions
 */
export const postsApi = {
  /**
   * Get all posts
   */
  getAll: async (): Promise<PostsListResponse> => {
    return get<PostsListResponse>(API_ENDPOINTS.POSTS_LIST);
  },

  /**
   * Get post by ID
   */
  getById: async (id: string): Promise<PostResponse> => {
    return get<PostResponse>(API_ENDPOINTS.POSTS_BY_ID(id));
  },

  /**
   * Get post by slug
   */
  getBySlug: async (slug: string): Promise<PostResponse> => {
    return get<PostResponse>(API_ENDPOINTS.POSTS_BY_SLUG(slug));
  },

  /**
   * Create a new post
   */
  create: async (data: CreatePostInput): Promise<PostResponse> => {
    return post<PostResponse, CreatePostInput>(API_ENDPOINTS.POSTS_LIST, data);
  },

  /**
   * Update a post
   */
  update: async (id: string, data: UpdatePostInput): Promise<PostResponse> => {
    return put<PostResponse, UpdatePostInput>(
      API_ENDPOINTS.POSTS_UPDATE(id),
      data
    );
  },

  /**
   * Publish a post
   */
  publish: async (id: string): Promise<PostResponse> => {
    return post<PostResponse>(API_ENDPOINTS.POSTS_PUBLISH(id));
  },
};

