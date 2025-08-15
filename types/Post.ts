export interface User {
  id: string;
  publicId: string;
  username: string;
  avatarUrl?: string | null;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  user: {
    username: string | null;
    avatarUrl: string | null;
    id: string;
    publicId: string | null;
  };
}

export interface Post {
  id?: number;
  partySize?: number;
  positionsNeeded?: string[];
  minRank?: string;
  maxRank?: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  commentCount?: number;
}
