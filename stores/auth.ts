// authStore.ts
import { defineStore } from "pinia";

interface UserState {
  username: string | null;
  avatarUrl: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): UserState => ({
    username: null,
    avatarUrl: null,
  }),

  actions: {
    login(username: string, avatarUrl: string | null = null) {
      this.username = username;
      this.avatarUrl = avatarUrl || null;
    },

    logout() {
      this.$reset();
      this.username = "";
      this.avatarUrl = null;
    },
  },
  persist: true,
});
