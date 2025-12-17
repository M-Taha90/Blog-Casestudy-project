"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateInviteMutation } from "@/lib/hooks/useInvites";
import { createInviteSchema, type CreateInviteFormData } from "@/lib/utils/validators";
import { showSuccessToast, showErrorToast } from "@/lib/utils/error-handler";
import { env } from "@/config/env";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

export function InviteDialog({ open, onOpenChange, postId }: InviteDialogProps) {
  const createInviteMutation = useCreateInviteMutation();
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInviteFormData>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: {
      postId,
    },
  });

  const inviteLink = inviteToken 
    ? `${env.NEXT_PUBLIC_APP_URL}/invites/${inviteToken}`
    : null;

  const onSubmit = async (data: CreateInviteFormData) => {
    try {
      const response = await createInviteMutation.mutateAsync({
        ...data,
        postId,
      });
      
      setInviteToken(response.token);
      showSuccessToast("Invite created successfully!");
      
      // Don't close dialog, show invite link
    } catch (error) {
      showErrorToast(error, "Failed to create invite");
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      showSuccessToast("Invite link copied to clipboard!");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showErrorToast("Failed to copy link", "Copy Error");
    }
  };

  const handleClose = () => {
    reset();
    setInviteToken(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
          <DialogDescription>
            {inviteToken 
              ? "Share this link with your collaborator"
              : "Send an invite to collaborate on this post"
            }
          </DialogDescription>
        </DialogHeader>

        {!inviteToken ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteeEmail">Email (optional)</Label>
              <Input
                id="inviteeEmail"
                type="email"
                placeholder="collaborator@example.com"
                {...register("inviteeEmail")}
                disabled={createInviteMutation.isPending}
              />
              {errors.inviteeEmail && (
                <p className="text-sm text-destructive">
                  {errors.inviteeEmail.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Leave empty to generate an invite link only
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createInviteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createInviteMutation.isPending}
              >
                {createInviteMutation.isPending ? "Creating..." : "Create Invite"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink || ""}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCopyLink}
                  variant={copied ? "default" : "outline"}
                >
                  {copied ? "✓ Copied" : "📋 Copy"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link will expire in 7 days
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

