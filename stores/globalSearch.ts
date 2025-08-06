import { defineStore } from "pinia";

export const useGlobalSearchStore = defineStore("globalSearch", {
  state: (): {
    searchQuery: string;
    filter: string | null;
  } => ({
    searchQuery: "",
    filter: null,
  }),
  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },
    setFilter(filter: string | null) {
      this.filter = filter;
    },
  },
});
