"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Public Route Component
 * Redirects to posts if user is already authenticated
 * Used for login/register pages
 */
export function PublicRoute({
  children,
  redirectTo = ROUTES.POSTS,
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

