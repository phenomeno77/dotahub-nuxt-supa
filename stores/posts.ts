import { defineStore } from "pinia";

export const usePostStore = defineStore("post", {
  state: () => ({
    shouldRefreshPosts: false,
  }),

  actions: {
    triggerRefresh() {
      this.shouldRefreshPosts = true;
    },

    clearRefreshFlag() {
      this.shouldRefreshPosts = false;
    },
  },
});
