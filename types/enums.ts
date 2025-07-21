export enum UserRole {
  user = "user",
  admin = "admin",
  moderator = "moderator",
}

export enum UserStatus {
  active = "active",
  banned = "banned",
  deleted = "deleted",
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

export enum NotificationType {
  comment_on_post = "commented on post",
}

export function getNotificationLabel(type: string): string {
  if (type in NotificationType) {
    return NotificationType[type as keyof typeof NotificationType];
  }
  return "did something...";
}
