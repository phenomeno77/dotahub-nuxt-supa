<script lang="ts" setup>
import { buttons } from "~/constants/labels";
import steamLogo from "~/assets/steam.svg";
import BarsActions from "./BarsActions.vue";
import SearchFilterBar from "./SearchFilterBar.vue";
import NotificationsList from "./notifications/NotificationsList.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const config = useRuntimeConfig();
const appName = config.public.appName;
const { loggedIn } = useUserSession();
const showMobileSearch = ref(false);

const handleLoginSteam = () => {
  window.location.href = "/api/auth/steam";
};
</script>

<template>
  <div class="flex items-center justify-between w-full px-3 py-2">
    <!-- Left: Logo -->
    <div class="navbar-logo">
      <NuxtLink :to="{ path: '/' }" class="font-bold text-lg no-underline">
        {{ appName }}
      </NuxtLink>
    </div>

    <!-- Center: Search (desktop only) -->
    <div v-if="loggedIn && route.path === '/'" class="hidden md:block">
      <SearchFilterBar />
    </div>

    <!-- Right: Actions (always shown) -->
    <div class="flex items-center gap-3">
      <!-- Mobile search toggle -->
      <Button
        v-if="loggedIn && route.path === '/'"
        icon="pi pi-search"
        size="large"
        rounded
        severity="secondary"
        aria-label="Search"
        class="!block md:!hidden"
        @click="showMobileSearch = true"
      />

      <!-- Sign-in / Action Menu -->
      <Button
        v-if="!loggedIn"
        severity="secondary"
        variant="outlined"
        class="ml-2"
        @click="handleLoginSteam"
      >
        <img :src="steamLogo" alt="Steam Logo" class="mr-2 w-6 h-6" />
        {{ buttons.SIGN_IN }}
      </Button>

      <div v-else class="flex items-center gap-3">
        <NotificationsList />
        <BarsActions />
      </div>
    </div>

    <!-- Mobile-only Search Sidebar -->
    <Drawer
      v-model:visible="showMobileSearch"
      position="top"
      modal
      :pt="{ root: { class: 'drawer-main' } }"
    >
      <SearchFilterBar @onSearchFilterClose="showMobileSearch = false" />
    </Drawer>
  </div>
</template>

<style scoped>
.navbar {
  height: 100%;
}

.p-sidebar-sm {
  padding: 1rem;
}
</style>
