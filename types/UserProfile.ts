import type { UserRole, UserStatus } from "~/utils/enums";

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  steamId?: string;
  role: UserRole;
  userStatus: UserStatus;
}
