"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePostsQuery, useCreatePostMutation } from "@/lib/hooks/usePosts";
import { useRealtimeUpdates } from "@/lib/hooks/useRealtimeUpdates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/posts/PostCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { showSuccessToast, showErrorToast } from "@/lib/utils/error-handler";
import { ROUTES } from "@/lib/constants";
import type { Post } from "@/types/models";

export default function PostsPage() {
  const router = useRouter();
  const { data: posts, isLoading, error } = usePostsQuery();
  const createPostMutation = useCreatePostMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "DRAFT" | "PUBLISHED">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "BLOG" | "CASE_STUDY">("all");

  // Enable real-time updates
  useRealtimeUpdates();

  // Filter posts based on search and filters
  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    return posts.filter((post: Post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || post.status === statusFilter;
      const matchesType = typeFilter === "all" || post.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [posts, searchQuery, statusFilter, typeFilter]);

  const handleCreatePost = async () => {
    const title = prompt("Enter post title:");
    if (!title) return;

    const type = confirm("Is this a Blog post? (Cancel for Case Study)") ? "BLOG" : "CASE_STUDY";

    try {
      const newPost = await createPostMutation.mutateAsync({ title, type });
      showSuccessToast("Post created successfully!");
      router.push(ROUTES.POST_EDIT(newPost.id));
    } catch (error) {
      showErrorToast(error, "Failed to create post");
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">All Posts</h1>
              <Button onClick={handleCreatePost} disabled={createPostMutation.isPending}>
                {createPostMutation.isPending ? "Creating..." : "+ New Post"}
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border rounded-md bg-background"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
                <select
                  className="px-3 py-2 border rounded-md bg-background"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                >
                  <option value="all">All Types</option>
                  <option value="BLOG">Blog</option>
                  <option value="CASE_STUDY">Case Study</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load posts. Please try again.</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredPosts.length === 0 && (
            <EmptyState
              title="No posts found"
              description={
                searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first post to get started"
              }
              action={
                !searchQuery && statusFilter === "all" && typeFilter === "all"
                  ? {
                      label: "Create Post",
                      onClick: handleCreatePost,
                    }
                  : undefined
              }
            />
          )}

          {/* Posts Grid */}
          {!isLoading && !error && filteredPosts.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post: Post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

