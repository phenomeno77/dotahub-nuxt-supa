import type { UserRole, UserStatus } from "~/types/enums";

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  steamId?: string;
  role: UserRole;
  userStatus: UserStatus;
}
