<script setup>
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import { useGlobalSearchStore } from "@/stores/globalSearch";

const searchQuery = ref("");
const selectedFilter = ref(null);

const filterOptions = [
  { label: "All", value: null },
  { label: "Users", value: "users" },
  { label: "Posts", value: "posts" },
  { label: "Items", value: "items" },
];

const store = useGlobalSearchStore();

function onSearch() {
  store.setSearchQuery(searchQuery.value);
}

function onFilterChange() {
  store.setFilter(selectedFilter.value);
}
</script>

<template>
  <div class="nav-search">
    <InputText
      v-model="searchQuery"
      placeholder="Search..."
      @input="onSearch"
      class="p-inputtext-sm w-100"
    />
    <!-- <Select
      v-model="selectedFilter"
      :options="filterOptions"
      optionLabel="label"
      placeholder="Filter"
      class="p-ml-2 p-dropdown-sm"
      @change="onFilterChange"
    /> -->
  </div>
</template>

<style scoped>
.nav-search {
  min-width: 300px;
  display: flex;
  align-items: center;
}
</style>
