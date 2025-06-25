export interface User {
  id: number;
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
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  comments?: Comment[];
  commentCount?: number;
}
