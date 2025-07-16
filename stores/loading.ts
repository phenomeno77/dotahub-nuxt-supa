import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", {
  state: () => ({
    isLoading: false,
  }),
  actions: {
    startLoading() {
      this.isLoading = true;
    },
    stopLoading() {
      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    },
  },
  persist: true,
});
