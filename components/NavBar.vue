<script lang="ts" setup>
import { buttons } from "~/constants/labels";
import { useAuthStore } from "~/stores/auth";
import steamLogo from "~/assets/steam.svg";
import NavBarProfileAvatar from "./NavBarProfileAvatar.vue";
import { UserRole } from "~/types/enums";

const config = useRuntimeConfig();
const appName = config.public.appName;
const { loggedIn, user } = useUserSession();
const supabase = useSupabaseClient();
const authStore = useAuthStore();
const showPremiumDialog = usePremiumDialog();
const showCreatePostDialog = useCreatePostDialog();
const loadingStore = useLoadingStore();

const handleLogout = async () => {
  loadingStore.startLoading();
  try {
    await $fetch("/api/user/logout", { method: "POST" });
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

const mainMenuItems = computed(() => {
  const menu: any[] = [];

  if (loggedIn.value) {
    if (user.value?.role === UserRole.admin) {
      menu.push({
        label: buttons.ADMIN_DASHBOARD,
        icon: "pi pi-users",
        command: () => navigateTo("/admin-dashboard"),
      });
    }

    menu.push({
      label: buttons.GO_PREMIUM,
      icon: "pi pi-crown",
      command: () => {
        showPremiumDialog.value = true;
      },
    });

    menu.push({
      label: buttons.CREATE_POST,
      icon: "pi pi-pen-to-square",
      command: () => {
        showCreatePostDialog.value = true;
      },
    });
  }

  return menu;
});

const menuPt = computed(() => ({
  root: {
    style: {
      height: "100%",
    },
  },
}));
</script>

<template>
  <Menubar :model="mainMenuItems" :pt="menuPt">
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
          <!-- @click="openInPopup('/api/auth/steam')" -->

          <img
            :src="steamLogo"
            alt="Steam Logo"
            class="me-2"
            style="width: 24px; height: 24px"
          />
          {{ buttons.SIGN_IN }}
        </Button>

        <div v-else class="d-flex align-items-center gap-3">
          <NavBarProfileAvatar @logout="handleLogout" />
        </div>
      </div>
    </template>
  </Menubar>
</template>

<style></style>
