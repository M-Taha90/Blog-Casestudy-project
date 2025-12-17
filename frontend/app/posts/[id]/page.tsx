"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import CollaborativeEditor from "@/components/editor/CollaborativeEditor";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePostQuery, useUpdatePostMutation, usePublishPostMutation } from "@/lib/hooks/usePosts";
import { useRealtimeUpdates } from "@/lib/hooks/useRealtimeUpdates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CollaboratorsPanel } from "@/components/posts/CollaboratorsPanel";
import { showSuccessToast, showErrorToast, handlePromiseToast } from "@/lib/utils/error-handler";
import { aiApi } from "@/lib/api";
import type { EditorRef } from "@/types/editor";
import { USER_COLORS } from "@/lib/constants";

export default function PostEditorPage() {
  const params = useParams();
  const postId = params.id as string;
  const { user } = useAuth();
  const { data: post, isLoading } = usePostQuery(postId);
  const updateMutation = useUpdatePostMutation(postId);
  const publishMutation = usePublishPostMutation(postId);
  const editorRef = useRef<EditorRef>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Enable real-time updates for this post
  useRealtimeUpdates(postId);

  // Generate user color based on user ID
  const userColor = user?.id
    ? USER_COLORS[user.id.charCodeAt(0) % USER_COLORS.length]
    : "#2563eb";

  const handleSave = async () => {
    // Content is auto-saved to Hocuspocus SQLite in real-time
    // This button is kept for future metadata updates (title, status, etc.)
    showSuccessToast('Content is automatically saved!', 'Auto-save');
    console.log('[Save] Content is automatically synced to Hocuspocus SQLite');
  };

  const handlePublish = async () => {
    if (!confirm("Are you sure you want to publish this post?")) return;

    console.log('[Publish] Publishing post:', postId);
    handlePromiseToast(
      publishMutation.mutateAsync(),
      {
        loading: "Publishing post...",
        success: "Post published successfully!",
        error: "Failed to publish post",
      }
    );
  };

  const handleAIGenerate = async () => {
    const brief = prompt("Enter a brief for AI content generation:");
    if (!brief) return;

    setIsGenerating(true);
    try {
      const response = await aiApi.generate({
        postId,
        brief,
      });

      if (response.ok && response.generatedText) {
        // Convert text to TipTap JSON format
        const lines = response.generatedText.split("\n\n").filter((p) => p.trim());
        const content = lines.map((line) => {
          const trimmed = line.trim();

          if (trimmed.startsWith("###")) {
            return {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: trimmed.replace(/^###\s*/, "") }],
            };
          } else if (trimmed.startsWith("##")) {
            return {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: trimmed.replace(/^##\s*/, "") }],
            };
          } else if (trimmed.startsWith("#")) {
            return {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: trimmed.replace(/^#\s*/, "") }],
            };
          } else {
            return {
              type: "paragraph",
              content: [{ type: "text", text: trimmed }],
            };
          }
        });

        const tipTapContent = {
          type: "doc",
          content: content.length > 0 ? content : [{ type: "paragraph", content: [{ type: "text", text: "" }] }],
        };

        if (editorRef.current?.editor) {
          setTimeout(() => {
            editorRef.current?.editor?.commands.setContent(tipTapContent);
          }, 100);
        }

        showSuccessToast("AI content generated!");
      } else {
        showErrorToast("Failed to generate content", "AI Generation");
      }
    } catch (error) {
      showErrorToast(error, "AI Generation Failed");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-96 w-full" />
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (!post) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Post not found</h1>
              <p className="text-muted-foreground">The post you're looking for doesn't exist.</p>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const isOwner = post.ownerId === user?.id;

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">{post.title}</h1>
              <Badge variant={post.status === "PUBLISHED" ? "success" : "secondary"}>
                {post.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateMutation.isPending} variant="outline">
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button onClick={handleAIGenerate} disabled={isGenerating} variant="secondary">
                {isGenerating ? "Generating..." : "✨ AI Generate"}
              </Button>
              {isOwner && post.status === "DRAFT" && (
                <Button onClick={handlePublish} disabled={publishMutation.isPending}>
                  {publishMutation.isPending ? "Publishing..." : "Publish"}
                </Button>
              )}
            </div>
          </div>

          <div className="mb-4 text-sm text-muted-foreground">
            <p>
              Collaborators: {post.collaborators?.length || 0} •
              Created: {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Two-column layout: Editor + Collaborators Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor - takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <CollaborativeEditor
                ref={editorRef}
                docId={postId}
                userId={user?.id || "anonymous"}
                userName={user?.name || "Anonymous"}
                userColor={userColor}
                onUpdate={() => {
                  // Content is auto-saved via Hocuspocus SQLite (no PostgreSQL)
                }}
                onImageUpload={(url) => {
                  console.log("Image uploaded:", url);
                }}
              />

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">💡 Tips:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Changes are automatically synced in real-time with other collaborators</li>
                  <li>• Use the toolbar above to format your content</li>
                  <li>• Drag and drop images directly into the editor</li>
                  <li>• Click "Save" to persist changes to the database</li>
                  {isOwner && <li>• Click "Publish" to make your post public</li>}
                </ul>
              </div>
            </div>

            {/* Collaborators Panel - takes 1 column on large screens */}
            <div className="lg:col-span-1">
              <CollaboratorsPanel
                post={post}
                currentUserId={user?.id || ""}
                isOwner={isOwner}
              />
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

