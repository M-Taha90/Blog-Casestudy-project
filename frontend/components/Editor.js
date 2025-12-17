/**
 * Editor Component
 * TipTap rich text editor with real-time collaboration support
 * 
 * Features:
 * - Rich text editing with TipTap StarterKit
 * - Real-time collaborative editing via Yjs and Hocuspocus
 * - Collaboration cursors (see other users typing)
 * - SSR-safe with immediatelyRender: false
 * - Exposes editor methods via ref (setContent, getContent, editor)
 * 
 * Props:
 * - content: Initial content (JSON format) - optional in collaborative mode
 * - onUpdate: Callback when content changes
 * - docId: Unique document ID for collaboration (post ID)
 * - user: User object with { name, color? } for cursor display
 */
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';

// Import individual extensions to build StarterKit without History
// when in collaborative mode, since Collaboration has its own history support
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Document from '@tiptap/extension-document';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Paragraph from '@tiptap/extension-paragraph';
import Strike from '@tiptap/extension-strike';
import Text from '@tiptap/extension-text';

const Editor = forwardRef(({ content, onUpdate, docId, user }, ref) => {
  // Step 1: Keep Y.Doc and provider stable - don't recreate them when state changes
  const ydoc = useMemo(() => (docId ? new Y.Doc() : null), [docId]);
  const provider = useMemo(() => (docId && ydoc ? new WebsocketProvider('ws://localhost:1234', docId, ydoc) : null), [docId, ydoc]);

  // Step 4: Simplify providerReady - only use for display status
  // Yjs will sync content asynchronously anyway, no need for complex connection checking

  // Configure extensions
  const extensions = useMemo(() => {
    // When using Collaboration, we need to exclude History from StarterKit
    // because Collaboration has its own history support and they conflict
    const baseExtensions = ydoc 
      ? [
          // Manually build StarterKit without History when in collaborative mode
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
        ]
      : [StarterKit]; // Use full StarterKit when not collaborating
    
    // Step 3: Initialize Collaboration extensions when ydoc and provider exist
    if (ydoc && provider) {
      baseExtensions.push(
        Collaboration.configure({
          document: ydoc,
        })
      );
      
      // Temporarily skip CollaborationCursor to avoid initialization errors
      // Basic collaboration (text syncing) will work without cursor tracking
      // We can add cursor tracking back once basic collaboration is confirmed working
      // TODO: Re-enable CollaborationCursor once we confirm the provider.awareness issue is resolved
      /*
      if (provider.awareness) {
        try {
          baseExtensions.push(
            CollaborationCursor.configure({
              provider,
              user: user || {
                name: 'Anonymous',
                color: '#2563eb',
              },
            })
          );
        } catch (error) {
          console.warn('[Editor] Failed to configure CollaborationCursor:', error);
        }
      }
      */
    }
    
    return baseExtensions;
  }, [ydoc, provider, user]);

  // In collaborative mode, don't set initial content - Yjs will sync it
  // Only set content if NOT in collaborative mode
  const initialContent = ydoc ? null : (content || '');

  const editor = useEditor({
    extensions,
    content: initialContent,
    immediatelyRender: false, // Required for SSR in Next.js
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getJSON());
      }
    },
  });

  // Expose editor instance to parent via ref
  useImperativeHandle(ref, () => ({
    setContent: (newContent) => {
      if (editor) {
        editor.commands.setContent(newContent);
      }
    },
    getContent: () => {
      return editor ? editor.getJSON() : null;
    },
    editor: editor
  }), [editor]);

  // Load initial content from database when editor is ready (only in collaborative mode)
  // Yjs will sync content asynchronously, so we check if editor is empty before loading
  useEffect(() => {
    if (editor && ydoc && content) {
      // Wait a bit for Yjs to potentially sync content from other clients first
      const timer = setTimeout(() => {
        const currentContent = editor.getJSON();
        const isEmpty = !currentContent || 
          (currentContent.type === 'doc' && 
           (!currentContent.content || currentContent.content.length === 0 || 
            (currentContent.content.length === 1 && 
             currentContent.content[0].type === 'paragraph' && 
             (!currentContent.content[0].content || currentContent.content[0].content.length === 0))));
        
        // Only set if editor is truly empty (no Yjs content synced yet)
        if (isEmpty) {
          console.log('[Editor] Loading initial content from database');
          editor.commands.setContent(content);
        } else {
          console.log('[Editor] Yjs already has content, skipping initial load');
        }
      }, 500); // Wait 500ms for Yjs to potentially sync
      
      return () => clearTimeout(timer);
    }
  }, [editor, ydoc, content]);

  // Cleanup WebSocket provider on unmount
  useEffect(() => {
    return () => {
      if (provider) {
        provider.destroy();
      }
      if (ydoc) {
        ydoc.destroy();
      }
    };
  }, [provider, ydoc]);

  if (!editor) {
    return (
      <div className="prose max-w-none p-4">
        <div>Loading editor...</div>
      </div>
    );
  }

  // Step 4: Simplify connection status - only for display
  const connectionStatus = provider && provider.ws?.readyState === WebSocket.OPEN
    ? '● Connected'
    : '○ Connecting...';

  // Step 2: Remove editor remounting - remove key that depends on providerReady
  return (
    <div>
      {docId && provider && (
        <div className={`text-xs mb-2 ${provider.ws?.readyState === WebSocket.OPEN ? 'text-green-600' : 'text-yellow-600'}`}>
          {connectionStatus}
        </div>
      )}
      <EditorContent 
        editor={editor} 
        className="prose max-w-none" 
      />
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
