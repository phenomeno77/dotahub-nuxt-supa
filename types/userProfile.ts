import type { UserRole, UserStatus } from "@prisma/client";

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string | null;
  steamId: string | null;
  role: UserRole;
  userStatus: UserStatus;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  isLoggedIn: boolean;
}
