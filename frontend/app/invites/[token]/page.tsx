"use client";

import { useParams, useRouter } from "next/navigation";
import { useInviteQuery, useAcceptInviteMutation } from "@/lib/hooks/useInvites";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";
import { showSuccessToast, showErrorToast, handlePromiseToast } from "@/lib/utils/error-handler";
import { ROUTES, POST_TYPE_LABELS } from "@/lib/constants";

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { isAuthenticated, user } = useAuth();
  const { data: inviteData, isLoading, error } = useInviteQuery(token);
  const acceptMutation = useAcceptInviteMutation();

  const handleAcceptInvite = async () => {
    if (!isAuthenticated) {
      showErrorToast("Please login to accept this invite", "Authentication Required");
      router.push(`${ROUTES.LOGIN}?redirect=/invites/${token}`);
      return;
    }

    try {
      const result = await handlePromiseToast(
        acceptMutation.mutateAsync(token),
        {
          loading: "Accepting invite...",
          success: "Invite accepted! Redirecting to post...",
          error: "Failed to accept invite",
        }
      );

      // Redirect to the post after successful acceptance
      setTimeout(() => {
        router.push(ROUTES.POST_EDIT(result.postId));
      }, 1500);
    } catch (error) {
      // Error already handled by handlePromiseToast
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (error || !inviteData) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Invalid Invite</CardTitle>
              <CardDescription>
                This invite link is invalid, expired, or has already been used.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push(ROUTES.HOME)}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const { invite } = inviteData;
  const isExpired = new Date(invite.expiresAt) < new Date();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>You've Been Invited to Collaborate!</CardTitle>
            <CardDescription>
              {invite.inviter?.name} has invited you to collaborate on a post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Post Info */}
            <div className="p-4 border rounded-lg space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{invite.post.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    {POST_TYPE_LABELS[invite.post.type as keyof typeof POST_TYPE_LABELS]}
                  </Badge>
                  <Badge variant={invite.post.status === "PUBLISHED" ? "success" : "secondary"}>
                    {invite.post.status}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Created: {new Date(invite.post.createdAt).toLocaleDateString()}</p>
                <p>Owner: {invite.inviter?.name} ({invite.inviter?.email})</p>
              </div>
            </div>

            {/* Invite Info */}
            <div className="space-y-2">
              {invite.inviteeEmail && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Invited email:</span>{" "}
                  <span className="font-medium">{invite.inviteeEmail}</span>
                </p>
              )}
              <p className="text-sm">
                <span className="text-muted-foreground">Expires:</span>{" "}
                <span className={isExpired ? "text-destructive font-medium" : ""}>
                  {new Date(invite.expiresAt).toLocaleString()}
                </span>
              </p>
            </div>

            {/* Status Messages */}
            {invite.used && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  This invite has already been used.
                </p>
              </div>
            )}

            {isExpired && !invite.used && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  This invite has expired. Please contact {invite.inviter?.name} for a new invite.
                </p>
              </div>
            )}

            {/* Actions */}
            {!invite.used && !isExpired && (
              <div className="flex gap-3">
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={handleAcceptInvite}
                      disabled={acceptMutation.isPending}
                      className="flex-1"
                    >
                      {acceptMutation.isPending ? "Accepting..." : "Accept Invite"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push(ROUTES.HOME)}
                    >
                      Decline
                    </Button>
                  </>
                ) : (
                  <div className="w-full space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You need to be logged in to accept this invite
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => router.push(`${ROUTES.LOGIN}?redirect=/invites/${token}`)}
                        className="flex-1"
                      >
                        Login
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`${ROUTES.REGISTER}?redirect=/invites/${token}`)}
                        className="flex-1"
                      >
                        Register
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(invite.used || isExpired) && (
              <Button onClick={() => router.push(ROUTES.HOME)} className="w-full">
                Go to Home
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

