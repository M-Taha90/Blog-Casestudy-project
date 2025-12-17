import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/lib/api";
import type {
  Post,
  CreatePostInput,
  UpdatePostInput,
} from "@/types/api";

// Query keys
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters?: any) => [...postKeys.lists(), { filters }] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

/**
 * Hook to fetch all posts
 */
export function usePostsQuery() {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: async () => {
      console.log('[API] Fetching posts list');
      const data = await postsApi.getAll();
      console.log('[API] Posts list received:', data.length, 'posts');
      return data;
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch a single post by ID
 */
export function usePostQuery(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: async () => {
      console.log('[API] Fetching post:', id);
      const data = await postsApi.getById(id);
      console.log('[API] Post received:', data);
      return data;
    },
    enabled: !!id,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

/**
 * Hook to create a new post
 */
export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => postsApi.create(data),
    onSuccess: (newPost) => {
      // Invalidate and refetch posts list
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      // Optionally add the new post to the cache
      queryClient.setQueryData(postKeys.detail(newPost.id), newPost);
    },
  });
}

/**
 * Hook to update a post
 */
export function useUpdatePostMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePostInput) => postsApi.update(postId, data),
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<Post>(
        postKeys.detail(postId)
      );

      // Optimistically update to the new value
      if (previousPost) {
        queryClient.setQueryData<Post>(postKeys.detail(postId), {
          ...previousPost,
          ...newData,
        });
      }

      // Return a context object with the snapshotted value
      return { previousPost };
    },
    onError: (err, newData, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousPost) {
        queryClient.setQueryData(
          postKeys.detail(postId),
          context.previousPost
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

/**
 * Hook to publish a post
 */
export function usePublishPostMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => postsApi.publish(postId),
    onSuccess: (updatedPost) => {
      // Update the post in cache
      queryClient.setQueryData(postKeys.detail(postId), updatedPost);
      
      // Invalidate posts list
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

