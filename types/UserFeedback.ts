import type { FeedbackStatus, FeedbackType } from "./enums";

export interface UserFeedback {
  id: number;
  userId: string;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  createdAt: Date;
  updatedAt: Date;
}
