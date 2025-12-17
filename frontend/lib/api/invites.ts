import { get, post } from "./client";
import type {
  CreateInviteInput,
  CreateInviteResponse,
  InviteCheckResponse,
  AcceptInviteResponse,
} from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Invites API functions
 */
export const invitesApi = {
  /**
   * Create a new invite
   */
  create: async (data: CreateInviteInput): Promise<CreateInviteResponse> => {
    return post<CreateInviteResponse, CreateInviteInput>(
      API_ENDPOINTS.INVITES_CREATE,
      data
    );
  },

  /**
   * Check invite by token
   */
  check: async (token: string): Promise<InviteCheckResponse> => {
    return get<InviteCheckResponse>(API_ENDPOINTS.INVITES_CHECK(token));
  },

  /**
   * Accept invite
   */
  accept: async (token: string): Promise<AcceptInviteResponse> => {
    return post<AcceptInviteResponse>(API_ENDPOINTS.INVITES_ACCEPT(token));
  },
};

