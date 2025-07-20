import type { Post, Comment } from "./Post";
import type { UserProfile } from "./UserProfile";
import type { NotificationType } from "./enums";

export interface Notification {
  id: string;
  userId: string;
  user: UserProfile;

  postId?: number;
  post?: Post;

  commentId?: number;
  comment?: Comment;

  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
