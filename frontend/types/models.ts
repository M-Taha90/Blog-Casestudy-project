// Backend Prisma models type definitions

export type PostType = "BLOG" | "CASE_STUDY";
export type PostStatus = "DRAFT" | "PUBLISHED";
export type CollabRole = "OWNER" | "EDITOR" | "COMMENTER" | "VIEWER";
export type ImageStatus = "PENDING" | "APPROVED" | "FLAGGED";

export interface User {
  id: string;
  name: string;
  email: string;
  pic?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  type: PostType;
  ownerId: string;
  owner?: User;
  status: PostStatus;
  content?: any; // JSON content from TipTap
  collabLimit?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  collaborators?: Collaborator[];
  versions?: PostVersion[];
  invites?: Invite[];
}

export interface PostVersion {
  id: string;
  postId: string;
  post?: Post;
  authorId: string;
  author?: User;
  snapshot: any; // JSON snapshot
  createdAt: Date | string;
}

export interface Collaborator {
  id: string;
  postId: string;
  post?: Post;
  userId: string;
  user?: User;
  role: CollabRole;
  addedAt: Date | string;
}

export interface Invite {
  id: string;
  postId: string;
  post?: Post;
  inviterId: string;
  inviter?: User;
  inviteeEmail?: string | null;
  token: string;
  used: boolean;
  expiresAt: Date | string;
  createdAt: Date | string;
}

export interface Image {
  id: string;
  postId?: string | null;
  uploaderId: string;
  key: string;
  url: string;
  status: ImageStatus;
  meta?: any; // JSON metadata
  createdAt: Date | string;
}

