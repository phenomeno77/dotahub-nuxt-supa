export interface User {
  id: string;
  username: string;
  avatarUrl?: string | null;
  isPremium: boolean;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  user: {
    username: string | null;
    avatarUrl: string | null;
    id: number;
    isPremium: boolean;
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
