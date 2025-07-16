<script lang="ts" setup>
import { buttons } from "~/constants/labels";
import { useAuthStore } from "~/stores/auth";
import steamLogo from "~/assets/steam.svg";
import NavBarActionMenu from "./NavBarActionMenu.vue";

const config = useRuntimeConfig();
const appName = config.public.appName;
const { loggedIn } = useUserSession();
const supabase = useSupabaseClient();
const authStore = useAuthStore();
const loadingStore = useLoadingStore();

const handleLogout = async () => {
  loadingStore.startLoading();
  try {
    await $fetch("/api/auth/logout", { method: "POST" });
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Logout error", e);
  } finally {
    const { clear } = useUserSession();
    clear();
    authStore.logout();

    loadingStore.stopLoading();
    await navigateTo("/", { replace: true });
  }
};

const handleLoginSteam = () => {
  window.location.href = "/api/auth/steam";
};

const menuPt = computed(() => ({
  root: {
    style: {
      height: "100%",
    },
  },
}));
</script>

<template>
  <Menubar :pt="menuPt">
    <!-- Logo / Title -->
    <template #start>
      <NuxtLink :to="{ path: '/' }" class="font-bold text-lg me-3">
        {{ appName }}
      </NuxtLink>
    </template>

    <template #end>
      <div class="d-flex align-items-center">
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
          <NavBarActionMenu @logout="handleLogout" />
        </div>
      </div>
    </template>
  </Menubar>
</template>

<style></style>
