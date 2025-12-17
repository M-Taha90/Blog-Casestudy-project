"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InviteDialog } from "./InviteDialog";
import { CollaboratorsList } from "./CollaboratorsList";
import type { Post } from "@/types/models";

interface CollaboratorsPanelProps {
  post: Post;
  currentUserId: string;
  isOwner: boolean;
}

export function CollaboratorsPanel({ post, currentUserId, isOwner }: CollaboratorsPanelProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const collaboratorCount = post.collaborators?.length || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>👥 Collaborators</span>
              <span className="text-sm font-normal text-muted-foreground">
                ({collaboratorCount})
              </span>
            </CardTitle>
            {isOwner && (
              <Button
                size="sm"
                onClick={() => setInviteDialogOpen(true)}
                variant="outline"
              >
                + Invite
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {post.collaborators && post.collaborators.length > 0 ? (
            <CollaboratorsList
              collaborators={post.collaborators}
              currentUserId={currentUserId}
            />
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              <p className="mb-2">No collaborators yet</p>
              {isOwner && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInviteDialogOpen(true)}
                >
                  Invite Someone
                </Button>
              )}
            </div>
          )}

          {isOwner && post.invites && post.invites.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3">Pending Invites</h4>
              <div className="space-y-2">
                {post.invites
                  .filter((invite) => !invite.used)
                  .map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate">
                          {invite.inviteeEmail || "No email (link only)"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        postId={post.id}
      />
    </>
  );
}

