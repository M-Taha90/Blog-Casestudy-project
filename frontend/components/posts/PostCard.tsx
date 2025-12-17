import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post } from "@/types/models";
import { POST_STATUS_LABELS, POST_TYPE_LABELS, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusVariant = (status: string) => {
    return status === "PUBLISHED" ? "success" : "secondary";
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={() => router.push(ROUTES.POST_EDIT(post.id))}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 mb-2">{post.title}</CardTitle>
            <CardDescription>
              {POST_TYPE_LABELS[post.type as keyof typeof POST_TYPE_LABELS]}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(post.status)}>
            {POST_STATUS_LABELS[post.status as keyof typeof POST_STATUS_LABELS]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatDate(post.createdAt)}</span>
          {post.collaborators && post.collaborators.length > 0 && (
            <span>{post.collaborators.length} collaborators</span>
          )}
        </div>
        {post.owner && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              {post.owner.pic && <AvatarImage src={post.owner.pic} alt={post.owner.name} />}
              <AvatarFallback className="text-xs">
                {getInitials(post.owner.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{post.owner.name}</span>
          </div>
        )}
        {post.collaborators && post.collaborators.length > 1 && (
          <div className="flex -space-x-2">
            {post.collaborators.slice(0, 5).map((collab) => (
              <Avatar key={collab.id} className="h-6 w-6 border-2 border-background">
                {collab.user?.pic && (
                  <AvatarImage src={collab.user.pic} alt={collab.user?.name} />
                )}
                <AvatarFallback className="text-xs">
                  {collab.user?.name ? getInitials(collab.user.name) : "?"}
                </AvatarFallback>
              </Avatar>
            ))}
            {post.collaborators.length > 5 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                +{post.collaborators.length - 5}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

