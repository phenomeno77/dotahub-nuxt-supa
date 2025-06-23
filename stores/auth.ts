// authStore.ts
import { UserRole } from "~/utils/enums";
import { defineStore } from "pinia";

interface AuthState {
  userId: string | null;
  userRole: UserRole | null;
  username: string | null;
  avatarUrl: string | null;
  isPremium: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    userId: null,
    userRole: null,
    username: null,
    avatarUrl: null,
    isPremium: false,
  }),

  actions: {
    login(
      userRole: UserRole,
      username: string,
      avatarUrl: string | null = null,
      isPremium: boolean,
      userId: string
    ) {
      this.username = username;
      this.avatarUrl = avatarUrl || null;
      this.isPremium = isPremium;
      this.userRole = userRole;
      this.userId = userId;
    },

    logout() {
      this.$reset();
      this.userRole = null;
      this.username = "";
      this.avatarUrl = null;
      this.isPremium = false;
      this.userId = null;
    },

    // async verifyUserStatus() {
    //   try {
    //     const response = await api.user.getCurrentUser();
    //     const { user, latestBan } = response.data;

    //     this.isPremium = user.isPremium;

    //     if (user.userStatus === "banned") {
    //       const reason = latestBan?.reason || "";
    //       const expiration = latestBan?.banExpiration || "";

    //       const FRONTEND_URL =
    //         import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

    //       const redirectUrl = `${FRONTEND_URL}?error=account_banned${
    //         expiration ? `&banExpiration=${encodeURIComponent(expiration)}` : ""
    //       }${reason ? `&banReason=${encodeURIComponent(reason)}` : ""}`;

    //       await api.user.logoutUser();

    //       window.location.href = redirectUrl;
    //     }
    //   } catch (error) {
    //     console.error("Failed to verify user status:", error);
    //     this.logout();
    //   }
    // },
  },
  persist: true,
});
