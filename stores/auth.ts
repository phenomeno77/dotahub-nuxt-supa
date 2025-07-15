// authStore.ts
import { defineStore } from "pinia";
import { UserRole } from "~/types/enums";

interface AuthState {
  userId: string | null;
  userRole: UserRole | null;
  username: string | null;
  avatarUrl: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    userId: null,
    userRole: null,
    username: null,
    avatarUrl: null,
  }),

  actions: {
    login(
      userRole: UserRole,
      username: string,
      avatarUrl: string | null = null,
      userId: string
    ) {
      this.username = username;
      this.avatarUrl = avatarUrl || null;
      this.userRole = userRole;
      this.userId = userId;
    },

    logout() {
      this.$reset();
      this.userRole = null;
      this.username = "";
      this.avatarUrl = null;
      this.userId = null;
    },
  },
  persist: true,
});
