// Editor-specific type definitions
import type { Editor } from "@tiptap/react";

export interface CollaborativeEditorProps {
  docId: string;
  userId: string;
  userName?: string;
  userColor?: string;
  // Note: content is NOT passed as prop - it's loaded from Hocuspocus SQLite
  onUpdate?: (content: any) => void;
  onImageUpload?: (url: string) => void;
}

export interface EditorRef {
  getContent: () => any | null;
  setContent: (content: any) => void;
  editor: Editor | null;
}

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  isSynced: boolean;
  isReconnecting: boolean;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

