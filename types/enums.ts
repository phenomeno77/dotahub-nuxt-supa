export enum UserRole {
  user = "user",
  admin = "admin",
  moderator = "moderator",
}

export enum UserStatus {
  active = "active",
  banned = "banned",
}

export enum Position {
  carry = "carry",
  mid = "mid",
  offlane = "offlane",
  soft_support = "soft support",
  hard_support = "hard support",
}

export enum Rank {
  Herald = "Herald",
  Guardian = "Guardian",
  Crusader = "Crusader",
  Archon = "Archon",
  Legend = "Legend",
  Ancient = "Ancient",
  Divine = "Divine",
  Immortal = "Immortal",
}

export enum FeedbackType {
  bug_report = "bug report",
  feature_request = "feature request",
  user_report = "user report",
  general_feedback = "general feedback",
}

export enum FeedbackStatus {
  open = "open",
  in_progress = "in progress",
  resolved = "resolved",
}

export enum NotificationType {
  comment_on_post = "commented on post",
  user_feedback = "new user feedback",
}

export function getNotificationLabel(type: string): string {
  if (type in NotificationType) {
    return NotificationType[type as keyof typeof NotificationType];
  }
  return "did something...";
}

export function getFeedbackLabel(type: string): string {
  if (type in FeedbackType) {
    return FeedbackType[type as keyof typeof FeedbackType];
  }
  return "did something...";
}

export function getFeedbackStatusLabel(type: string): string {
  if (type in FeedbackStatus) {
    return FeedbackStatus[type as keyof typeof FeedbackStatus];
  }
  return "did something...";
}
