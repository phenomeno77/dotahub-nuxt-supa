import type { UserRole, UserStatus } from "~/types/enums";

export interface BanRecord {
  id: number;
  reason: string;
  bannedAt: string;
  banExpiration?: string;
  bannedById?: string;
  bannedBy?: {
    id: string;
    username: string;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  steamId?: string;
  role: UserRole;
  userStatus: UserStatus;
  lastSeenAt?: string;
  isOnline?: boolean;
  banHistory?: BanRecord[];
}
