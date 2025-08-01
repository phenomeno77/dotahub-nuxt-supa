import type { FeedbackStatus, FeedbackType } from "./enums";
export interface UserFeedback {
  id: number;
  userId: string;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  createdAt: Date;
  updatedAt: Date;
  user: {
    username: string | null;
    avatarUrl: string | null;
    steamId: string;
    id: string;
  };
}
