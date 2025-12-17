import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invitesApi } from "@/lib/api";
import type {
  CreateInviteInput,
  CreateInviteResponse,
  InviteCheckResponse,
  AcceptInviteResponse,
} from "@/types/api";
import { postKeys } from "./usePosts";

// Query keys for invites
export const inviteKeys = {
  all: ["invites"] as const,
  check: (token: string) => [...inviteKeys.all, "check", token] as const,
};

/**
 * Hook to check invite details by token
 */
export function useInviteQuery(token: string) {
  return useQuery({
    queryKey: inviteKeys.check(token),
    queryFn: () => invitesApi.check(token),
    enabled: !!token,
  });
}

/**
 * Hook to create a new invite
 */
export function useCreateInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInviteInput) => invitesApi.create(data),
    onSuccess: (data, variables) => {
      // Invalidate the post query to refresh collaborators
      queryClient.invalidateQueries({ 
        queryKey: postKeys.detail(variables.postId) 
      });
      
      // Also invalidate posts list
      queryClient.invalidateQueries({ 
        queryKey: postKeys.lists() 
      });
    },
  });
}

/**
 * Hook to accept an invite
 */
export function useAcceptInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => invitesApi.accept(token),
    onSuccess: (data) => {
      // Invalidate the specific post query
      if (data.postId) {
        queryClient.invalidateQueries({ 
          queryKey: postKeys.detail(data.postId) 
        });
      }
      
      // Invalidate posts list
      queryClient.invalidateQueries({ 
        queryKey: postKeys.lists() 
      });
      
      // Invalidate the invite check query
      queryClient.invalidateQueries({ 
        queryKey: inviteKeys.all 
      });
    },
  });
}

