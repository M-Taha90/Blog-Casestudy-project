"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { AppLayout } from "@/components/layout/AppLayout";

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {APP_NAME}
            </h1>
            <p className="text-xl text-muted-foreground">
              Collaborative real-time blog and case study editor
            </p>
          </div>

          {isAuthenticated ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back, {user?.name}!</CardTitle>
                  <CardDescription>
                    Ready to create or edit your posts?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => router.push(ROUTES.POSTS)}
                    size="lg"
                    className="w-full"
                  >
                    View My Posts
                  </Button>
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>New User?</CardTitle>
                  <CardDescription>
                    Create an account to start collaborating
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => router.push(ROUTES.REGISTER)}
                    size="lg"
                    className="w-full"
                  >
                    Register
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Already Have an Account?</CardTitle>
                  <CardDescription>
                    Sign in to access your posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => router.push(ROUTES.LOGIN)}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Login
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Real-time Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Edit documents together with your team in real-time using Yjs and Hocuspocus.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rich Text Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Powerful TipTap editor with image support, formatting, and more.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI-Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate content using Google Gemini AI to boost your productivity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

