<script lang="ts" setup>
import { buttons } from "~/constants/labels";
import steamLogo from "~/assets/steam.svg";
import BarsActions from "./BarsActions.vue";
import SearchFilterBar from "./SearchFilterBar.vue";
import NotificationsList from "./notifications/NotificationsList.vue";

const config = useRuntimeConfig();
const appName = config.public.appName;
const { loggedIn } = useUserSession();
const showMobileSearch = ref(false);

const handleLoginSteam = () => {
  window.location.href = "/api/auth/steam";
};
</script>

<template>
  <div
    class="navbar d-flex align-items-center justify-content-between w-100 px-3 py-2"
  >
    <!-- Left: Logo -->
    <div class="navbar-logo">
      <NuxtLink
        :to="{ path: '/' }"
        class="fw-bold text-lg text-decoration-none"
      >
        {{ appName }}
      </NuxtLink>
    </div>

    <!-- Center: Search (desktop only) -->
    <div class="d-none d-md-block" v-if="loggedIn">
      <SearchFilterBar />
    </div>

    <!-- Right: Actions (always shown) -->
    <div class="d-flex align-items-center gap-3">
      <!-- Mobile search toggle -->
      <Button
        v-if="loggedIn"
        icon="pi pi-search"
        class="d-md-none"
        size="large"
        rounded
        severity="secondary"
        aria-label="Search"
        @click="showMobileSearch = true"
      />

      <!-- Sign-in / Action Menu -->
      <Button
        v-if="!loggedIn"
        severity="secondary"
        variant="outlined"
        class="ms-2"
        @click="handleLoginSteam"
      >
        <img
          :src="steamLogo"
          alt="Steam Logo"
          class="me-2"
          style="width: 24px; height: 24px"
        />
        {{ buttons.SIGN_IN }}
      </Button>

      <div v-else class="d-flex align-items-center gap-3">
        <NotificationsList />
        <BarsActions />
      </div>
    </div>

    <!-- Mobile-only Search Sidebar -->
    <Drawer
      v-model:visible="showMobileSearch"
      position="top"
      modal
      :pt="{
        root: {
          class: 'drawer-main',
        },
      }"
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
