'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useImperativeHandle, forwardRef } from 'react';

const Editor = forwardRef(({ content, onUpdate }, ref) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
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
});

Editor.displayName = 'Editor';

export default Editor;
