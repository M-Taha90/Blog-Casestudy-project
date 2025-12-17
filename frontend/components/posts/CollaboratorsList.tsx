import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Collaborator } from "@/types/models";
import { COLLAB_ROLE_LABELS } from "@/lib/constants";

interface CollaboratorsListProps {
  collaborators: Collaborator[];
  currentUserId: string;
}

export function CollaboratorsList({ collaborators, currentUserId }: CollaboratorsListProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "OWNER":
        return "default";
      case "EDITOR":
        return "secondary";
      case "COMMENTER":
        return "outline";
      case "VIEWER":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Sort collaborators: owner first, then current user, then others
  const sortedCollaborators = [...collaborators].sort((a, b) => {
    if (a.role === "OWNER") return -1;
    if (b.role === "OWNER") return 1;
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return 0;
  });

  if (collaborators.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No collaborators yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedCollaborators.map((collaborator) => {
        const isCurrentUser = collaborator.userId === currentUserId;
        const user = collaborator.user;

        return (
          <div
            key={collaborator.id}
            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
              isCurrentUser ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-9 w-9">
                {user?.pic && (
                  <AvatarImage src={user.pic} alt={user.name} />
                )}
                <AvatarFallback>
                  {user?.name ? getInitials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {user?.name || "Unknown User"}
                  </p>
                  {isCurrentUser && (
                    <span className="text-xs text-muted-foreground">(You)</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || "No email"}
                </p>
              </div>
            </div>
            <Badge variant={getRoleBadgeVariant(collaborator.role)} className="ml-2">
              {COLLAB_ROLE_LABELS[collaborator.role as keyof typeof COLLAB_ROLE_LABELS]}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

