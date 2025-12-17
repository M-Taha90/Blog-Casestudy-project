"use client";

import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Collaboration } from "@tiptap/extension-collaboration";
import { CollaborationCursor } from "@tiptap/extension-collaboration-cursor";
import Image from "@tiptap/extension-image";

// Import individual extensions
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import Blockquote from "@tiptap/extension-blockquote";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import CodeBlock from "@tiptap/extension-code-block";
import HardBreak from "@tiptap/extension-hard-break";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";

import { getWsUrl } from "@/config/env";
import { uploadsApi } from "@/lib/api";
import { showErrorToast, showSuccessToast } from "@/lib/utils/error-handler";
import type { CollaborativeEditorProps, EditorRef } from "@/types/editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CollaborativeEditor = forwardRef<EditorRef, CollaborativeEditorProps>(
  ({ docId, userId, userName = `User ${userId}`, userColor = "#2563eb", onImageUpload, onUpdate }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [providerReady, setProviderReady] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Create Yjs document and WebSocket provider
    const ydoc = useMemo(() => new Y.Doc(), []);
    const provider = useMemo(() => {
      if (!docId) return null;
      const p = new WebsocketProvider(getWsUrl(), docId, ydoc, {
        connect: true,
      });
      return p;
    }, [docId, ydoc]);

    // Wait for provider awareness to be ready
    useEffect(() => {
      if (!provider) {
        setProviderReady(false);
        return;
      }

      const checkAwareness = () => {
        try {
          if (provider.awareness && typeof provider.awareness.getLocalState === "function") {
            setProviderReady(true);
          } else {
            setTimeout(checkAwareness, 100);
          }
        } catch (error) {
          setTimeout(checkAwareness, 100);
        }
      };

      const timer = setTimeout(checkAwareness, 200);
      return () => clearTimeout(timer);
    }, [provider]);

    // Configure extensions
    const extensions = useMemo(() => {
      const baseExtensions = [
        Document,
        Paragraph,
        Text,
        Heading,
        Bold,
        Italic,
        Strike,
        Code,
        Blockquote,
        BulletList,
        OrderedList,
        ListItem,
        CodeBlock,
        HardBreak,
        Dropcursor,
        Gapcursor,
        Image.configure({
          inline: false,
          allowBase64: false,
          HTMLAttributes: {
            class: "rounded-lg max-w-full h-auto my-4",
          },
        }),
      ];

      baseExtensions.unshift(
        Collaboration.configure({
          document: ydoc,
        })
      );

      if (provider && providerReady) {
        try {
          if (provider.awareness && typeof provider.awareness.getLocalState === "function") {
            baseExtensions.push(
              CollaborationCursor.configure({
                provider,
                user: {
                  name: userName,
                  color: userColor,
                },
              })
            );
          }
        } catch (error) {
          console.warn("Failed to configure CollaborationCursor:", error);
        }
      }

      return baseExtensions;
    }, [ydoc, provider, providerReady, userName, userColor]);

    // Initialize editor
    const editor = useEditor({
      extensions,
      content: "",
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] p-4",
        },
      },
      onUpdate: ({ editor }) => {
        if (onUpdate) {
          onUpdate(editor.getJSON());
        }
      },
    });

    // Content is loaded automatically from Hocuspocus SQLite - no need to load from PostgreSQL
    useEffect(() => {
      if (!editor || !provider) return;

      const checkSync = () => {
        if (provider.synced) {
          console.log("[CollaborativeEditor] ✅ Synced with Hocuspocus SQLite - content loaded");
        } else {
          console.log("[CollaborativeEditor] ⏳ Waiting for Hocuspocus sync...");
          setTimeout(checkSync, 500);
        }
      };

      const timer = setTimeout(checkSync, 500);
      return () => clearTimeout(timer);
    }, [editor, provider]);

    // Expose editor methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getContent: () => {
          return editor ? editor.getJSON() : null;
        },
        setContent: (content) => {
          if (editor) {
            editor.commands.setContent(content);
          }
        },
        editor: editor,
      }),
      [editor]
    );

    // Monitor connection
    useEffect(() => {
      if (!provider || !editor) return;

      const handleStatus = (event: { status: string }) => {
        setIsConnected(event.status === "connected");
      };

      if (provider.on) {
        provider.on("status", handleStatus);
      }

      return () => {
        if (provider.off) {
          provider.off("status", handleStatus);
        }
      };
    }, [provider, editor]);

    // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !editor) return;

      if (!file.type.startsWith("image/")) {
        showErrorToast("Please select an image file", "Invalid File");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("Image size must be less than 5MB", "File Too Large");
        return;
      }

      try {
        const response = await uploadsApi.uploadImage(file);

        editor
          .chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: {
              src: response.url,
              alt: file.name || "Uploaded image",
            },
          })
          .run();

        if (onImageUpload) {
          onImageUpload(response.url);
        }

        showSuccessToast("Image uploaded successfully!");
      } catch (error) {
        showErrorToast(error, "Failed to upload image");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    // Handle drag and drop
    useEffect(() => {
      if (!editor) return;

      const handleDrop = (event: DragEvent) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return;

        const imageFile = Array.from(files).find((file) => file.type.startsWith("image/"));
        if (!imageFile) return;

        event.preventDefault();

        const fakeEvent = {
          target: { files: [imageFile] },
        } as any;
        handleImageUpload(fakeEvent);
      };

      const handleDragOver = (event: DragEvent) => {
        event.preventDefault();
      };

      const editorElement = editor.view.dom;
      editorElement.addEventListener("drop", handleDrop as EventListener);
      editorElement.addEventListener("dragover", handleDragOver as EventListener);

      return () => {
        editorElement.removeEventListener("drop", handleDrop as EventListener);
        editorElement.removeEventListener("dragover", handleDragOver as EventListener);
      };
    }, [editor]);

    // Cleanup
    useEffect(() => {
      return () => {
        if (provider) provider.destroy();
        if (ydoc) ydoc.destroy();
      };
    }, [provider, ydoc]);

    if (!editor) {
      return (
        <div className="p-4">
          <div>Loading editor...</div>
          {provider && !providerReady && <div className="text-xs text-gray-500 mt-2">Initializing collaboration...</div>}
        </div>
      );
    }

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className={cn("text-xs px-3 py-2 border-b flex items-center justify-between", isConnected ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700")}>
          <span>{isConnected ? "● Connected" : "○ Connecting..."}</span>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
          <Button type="button" size="sm" variant={editor.isActive("bold") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBold().run()}>
            <strong>B</strong>
          </Button>
          <Button type="button" size="sm" variant={editor.isActive("italic") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <em>I</em>
          </Button>
          <Button type="button" size="sm" variant={editor.isActive("strike") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <s>S</s>
          </Button>
          <Button type="button" size="sm" variant={editor.isActive("code") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleCode().run()}>
            Code
          </Button>
          <div className="w-px bg-border mx-1" />
          <Button type="button" size="sm" variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            H1
          </Button>
          <Button type="button" size="sm" variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            H2
          </Button>
          <Button type="button" size="sm" variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            H3
          </Button>
          <div className="w-px bg-border mx-1" />
          <Button type="button" size="sm" variant={editor.isActive("bulletList") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            • List
          </Button>
          <Button type="button" size="sm" variant={editor.isActive("orderedList") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            1. List
          </Button>
          <Button type="button" size="sm" variant={editor.isActive("blockquote") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            Quote
          </Button>
          <Button type="button" size="sm" variant={editor.isActive("codeBlock") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
            Code Block
          </Button>
          <div className="w-px bg-border mx-1" />
          <Button type="button" size="sm" variant="ghost" onClick={() => fileInputRef.current?.click()}>
            📷 Image
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>

        <EditorContent editor={editor} className="prose max-w-none" />
      </div>
    );
  }
);

CollaborativeEditor.displayName = "CollaborativeEditor";

export default CollaborativeEditor;

