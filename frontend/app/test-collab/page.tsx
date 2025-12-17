"use client";

import { useRef, useState, useEffect } from "react";
import CollaborativeEditor from "@/components/editor/CollaborativeEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import type { EditorRef } from "@/types/editor";
import { USER_COLORS } from "@/lib/constants";

export default function TestCollabPage() {
  const editorRef = useRef<EditorRef>(null);
  const [docId, setDocId] = useState("test-doc-1");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userColor, setUserColor] = useState("#2563eb");

  // Initialize user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id || "test-user");
        setUserName(user.name || "Test User");
        setUserColor(USER_COLORS[user.id?.charCodeAt(0) % USER_COLORS.length] || "#2563eb");
      } catch (error) {
        console.error("Failed to parse user data:", error);
        setUserId(`user-${Math.random().toString(36).substr(2, 9)}`);
        setUserName("Test User");
      }
    } else {
      setUserId(`user-${Math.random().toString(36).substr(2, 9)}`);
      setUserName("Test User");
    }
  }, []);

  const getContent = () => {
    const content = editorRef.current?.getContent();
    console.log("Current content:", content);
    alert(JSON.stringify(content, null, 2));
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Collaboration Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="docId">Document ID</Label>
                <Input
                  id="docId"
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                  placeholder="test-doc-1"
                />
              </div>
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="user-123"
                />
              </div>
              <div>
                <Label htmlFor="userName">User Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <Button onClick={getContent} variant="outline">
                Get Content (Console)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collaborative Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <CollaborativeEditor
              ref={editorRef}
              docId={docId}
              userId={userId}
              userName={userName}
              userColor={userColor}
              onUpdate={(content) => {
                console.log("Content updated:", content);
              }}
              onImageUpload={(url) => {
                console.log("Image uploaded:", url);
              }}
            />
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">🧪 Testing Instructions:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>1. Open this page in multiple browser tabs with different user names</li>
            <li>2. Use the same Document ID in all tabs to collaborate</li>
            <li>3. Type in one tab and see changes appear in others in real-time</li>
            <li>4. See other users' cursors and selections</li>
            <li>5. Upload images and see them sync across all tabs</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}

