'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

export default function Editor({ content, onUpdate }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getJSON());
      }
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getJSON();
      // Only update if content actually changed
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content || '');
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} className="prose max-w-none" />;
}
