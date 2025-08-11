import type { Position, Rank } from "~/types/enums";

export const useGlobalFilterSearch = defineStore("globalFilterSearch", {
  state: (): {
    searchQuery: string;
    rankFilter: Rank | null;
    positionFilter: Position[];
  } => ({
    searchQuery: "",
    rankFilter: null,
    positionFilter: [],
  }),
  actions: {
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },
    setRankFilter(rank: Rank | null) {
      this.rankFilter = rank;
    },
    setPositionFilter(positions: Position[]) {
      this.positionFilter = positions;
    },
  },
});
