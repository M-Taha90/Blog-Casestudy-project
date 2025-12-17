"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { ROUTES, APP_NAME } from "@/lib/constants";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href={ROUTES.HOME} className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">{APP_NAME}</span>
          </Link>
          {isAuthenticated && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href={ROUTES.POSTS}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Posts
              </Link>
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  {user?.pic && <AvatarImage src={user.pic} alt={user.name} />}
                  <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline-block">
                  {user?.name}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(ROUTES.LOGIN)}
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => router.push(ROUTES.REGISTER)}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

