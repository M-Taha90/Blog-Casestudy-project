"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket";
import { SOCKET_EVENTS } from "@/lib/constants";
import { postKeys } from "./usePosts";

/**
 * Hook to subscribe to real-time updates via Socket.IO
 * Automatically invalidates React Query cache when events are received
 * 
 * @param postId - Optional post ID to watch for specific updates
 */
export function useRealtimeUpdates(postId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Connect socket
    socket.connect();
    console.log("[Socket.IO] Connected");

    // Join specific post room if postId provided
    if (postId) {
      socket.emit("join-post", postId);
      console.log(`[Socket.IO] Joined room for post: ${postId}`);
    }

    // Listen for general posts updates (create, delete, publish, etc.)
    const handlePostsUpdate = () => {
      console.log("[Socket.IO] Posts updated - invalidating cache");
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      
      // Also invalidate all post details to catch status changes
      queryClient.invalidateQueries({ queryKey: postKeys.details() });
      
      // If watching specific post, refetch it
      if (postId) {
        queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      }
    };

    // Listen for specific post content updates (from Hocuspocus sync)
    const handlePostContentUpdate = ({ postId: updatedPostId }: { postId: string }) => {
      console.log(`[Socket.IO] Post content updated: ${updatedPostId}`);
      // Invalidate specific post query
      queryClient.invalidateQueries({ queryKey: postKeys.detail(updatedPostId) });
    };

    socket.on(SOCKET_EVENTS.POSTS_UPDATE, handlePostsUpdate);
    socket.on(SOCKET_EVENTS.POST_CONTENT_UPDATED, handlePostContentUpdate);

    // Cleanup
    return () => {
      if (postId) {
        socket.emit("leave-post", postId);
        console.log(`[Socket.IO] Left room for post: ${postId}`);
      }
      socket.off(SOCKET_EVENTS.POSTS_UPDATE, handlePostsUpdate);
      socket.off(SOCKET_EVENTS.POST_CONTENT_UPDATED, handlePostContentUpdate);
    };
  }, [queryClient, postId]);

  return {
    isConnected: socket.connected,
  };
}

