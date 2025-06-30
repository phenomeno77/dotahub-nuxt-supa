// authStore.ts
import { defineStore } from "pinia";
import { UserRole } from "~/types/enums";

interface AuthState {
  userId: string | null;
  userRole: UserRole | null;
  username: string | null;
  avatarUrl: string | null;
  isPremium: boolean;
  premiumExpiresAt: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    userId: null,
    userRole: null,
    username: null,
    avatarUrl: null,
    isPremium: false,
    premiumExpiresAt: null,
  }),

  actions: {
    login(
      userRole: UserRole,
      username: string,
      avatarUrl: string | null = null,
      isPremium: boolean,
      userId: string,
      premiumExpiresAt: string | null = null
    ) {
      this.username = username;
      this.avatarUrl = avatarUrl || null;
      this.isPremium = isPremium;
      this.userRole = userRole;
      this.userId = userId;
      this.premiumExpiresAt = premiumExpiresAt || null;
    },

    logout() {
      this.$reset();
      this.userRole = null;
      this.username = "";
      this.avatarUrl = null;
      this.isPremium = false;
      this.userId = null;
    },
  },
  persist: true,
});
