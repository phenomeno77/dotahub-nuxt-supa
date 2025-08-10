<script setup lang="ts">
import InputText from "primevue/inputtext";
import { useGlobalSearchStore } from "@/stores/globalSearch";
import { useDebounceFn } from "@vueuse/core";
import { labels } from "~/constants/labels";
import { Position, Rank } from "~/types/enums";

const emit = defineEmits(["onSearchFilterClose"]);

const positions = ref(Object.entries(Position));
const ranks = ref(Object.values(Rank));
const searchQuery = ref("");
const store = useGlobalSearchStore();
const showFilterDrawer = ref(false);
const selectedRank = ref<Rank | null>(null);
const selectedPositions = ref<Position[]>([]);

const onSearch = useDebounceFn(() => {
  const trimmed = searchQuery.value.trim();
  store.setSearchQuery(trimmed);
  emit("onSearchFilterClose");
}, 400);

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

const onDrawerHide = () => {
  selectedRank.value = null;
  selectedPositions.value = [];
};
</script>

<template>
  <div class="nav-search">
    <InputText
      v-model="searchQuery"
      :placeholder="labels.SEARCH_BY_USERNAME"
      @keyup.enter="onSearch"
      class="p-inputtext-sm w-100"
    />

    <Button
      icon="pi pi-filter"
      size="small"
      severity="secondary"
      @click="showFilterDrawer = true"
    />
  </div>

  <Drawer
    v-model:visible="showFilterDrawer"
    :header="labels.FILTER"
    position="top"
    @hide="onDrawerHide"
    modal
    :style="{
      height: '50%',
    }"
    :pt="{
      root: {
        class: 'drawer-main',
      },
    }"
  >
    <div class="d-flex flex-column gap-3">
      <div class="d-flex flex-column gap-2">
        <strong>{{ labels.SELECT_RANK }}</strong>

        <Select
          class="w-100"
          v-model="selectedRank"
          :options="ranks"
          :placeholder="labels.SELECT_RANK"
        />
      </div>

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
  </Drawer>
</template>

<style scoped>
.nav-search {
  min-width: 250px;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
