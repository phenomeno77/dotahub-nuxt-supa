<script setup lang="ts">
import InputText from "primevue/inputtext";
import { useGlobalFilterSearch } from "~/stores/globalFilterSearch";
import { useDebounceFn } from "@vueuse/core";
import { labels } from "~/constants/labels";
import { Position, Rank } from "~/types/enums";

const emit = defineEmits(["onSearchFilterClose"]);

const positions = ref(Object.entries(Position));
const ranks = ref(Object.values(Rank));
const searchQuery = ref("");
const store = useGlobalFilterSearch();
const showFilterDrawer = ref(false);
const selectedRank = ref<Rank | null>(null);
const selectedPositions = ref<Position[]>([]);

const onSearch = useDebounceFn(() => {
  const trimmed = searchQuery.value.trim();
  store.setSearchQuery(trimmed);
  emit("onSearchFilterClose");
}, 400);

const onUseFilter = () => {
  store.setRankFilter(selectedRank.value);
  store.setPositionFilter(selectedPositions.value);
  showFilterDrawer.value = false;
  emit("onSearchFilterClose");
};

const getPositionIcon = (position: string) => {
  switch (position.toLowerCase()) {
    case "carry":
      return "pi pi-bolt";
    case "mid":
      return "pi pi-bullseye";
    case "offlane":
      return "pi pi-shield";
    case "soft support":
      return "pi pi-users";
    case "hard support":
      return "pi pi-heart";
    default:
      return "pi pi-user";
  }
};

const resetFilter = () => {
  if (selectedRank.value || selectedPositions.value.length) {
    selectedRank.value = null;
    selectedPositions.value = [];
  }

  if (store.rankFilter || store.positionFilter.length) {
    store.setRankFilter(null);
    store.setPositionFilter([]);
    showFilterDrawer.value = false;

    emit("onSearchFilterClose");
  }
};

const onShowFilter = () => {
  selectedRank.value = store.rankFilter;
  selectedPositions.value = store.positionFilter;
};
</script>

<template>
  <!-- Search Bar -->
  <div class="nav-search flex items-center gap-2 min-w-[250px]">
    <InputText
      v-model="searchQuery"
      :placeholder="labels.SEARCH_BY_USERNAME"
      @keyup.enter="onSearch"
      class="p-inputtext-sm w-full"
    />

    <Button
      icon="pi pi-filter"
      size="small"
      severity="secondary"
      @click="showFilterDrawer = true"
    />
  </div>

  <!-- Filter Drawer -->
  <Drawer
    v-model:visible="showFilterDrawer"
    :header="labels.FILTER"
    position="top"
    @show="onShowFilter"
    :style="{ height: 'auto' }"
    modal
    :pt="{ root: { class: 'drawer-main' } }"
  >
    <div class="flex flex-col gap-3">
      <!-- Rank Selection -->
      <div class="flex flex-col gap-2">
        <strong>{{ labels.SELECT_RANK }}</strong>

        <Select
          class="w-full"
          v-model="selectedRank"
          :options="ranks"
          :placeholder="labels.SELECT_RANK"
        />
      </div>

      <!-- Positions -->
      <div>
        <strong>{{ labels.POSITIONS }}</strong>

        <div class="checkbox-group p-1">
          <div
            v-for="[positionKey, positionValue] in positions"
            :key="positionKey"
            class="checkbox-item"
          >
            <Checkbox
              v-model="selectedPositions"
              :inputId="'checkbox-' + positionKey"
              :value="positionKey"
            />
            <i :class="getPositionIcon(positionKey)" class="position-icon"></i>
            <label :for="'checkbox-' + positionKey">
              {{ positionValue }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Buttons -->
    <template #footer>
      <div class="flex w-full">
        <div>
          <Button
            v-if="selectedRank || selectedPositions.length > 0"
            :label="labels.RESET_FILTER"
            variant="text"
            @click="resetFilter"
          />
        </div>
        <div class="ml-auto">
          <Button
            :label="labels.USE_FILTER"
            severity="secondary"
            @click="onUseFilter"
          />
        </div>
      </div>
    </template>
  </Drawer>
</template>
