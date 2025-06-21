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

export type Position =
  | "carry"
  | "mid"
  | "offlane"
  | "soft_support"
  | "hard_support";

export type Rank =
  | "Herald"
  | "Guardian"
  | "Crusader"
  | "Archon"
  | "Legend"
  | "Ancient"
  | "Divine"
  | "Immortal";
