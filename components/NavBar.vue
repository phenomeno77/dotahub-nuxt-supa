<script lang="ts" setup>
import { buttons } from "~/constants/labels";
import { useAuthStore } from "~/stores/auth";
import steamLogo from "~/assets/steam.svg";
import NavBarProfileAvatar from "./NavBarProfileAvatar.vue";

const config = useRuntimeConfig();
const appName = config.public.appName;
const { loggedIn, openInPopup } = useUserSession();
const supabase = useSupabaseClient();
const authStore = useAuthStore();

const handleLogout = async () => {
  try {
    await $fetch("/api/user/logout", { method: "POST" });
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Logout error", e);
  } finally {
    const { clear } = useUserSession();
    clear();
    authStore.logout();

    await navigateTo("/", { replace: true });
  }
};

const handleLoginSteam = () => {
  window.location.href = "/api/auth/steam";
};
</script>

<template>
  <Menubar
    :pt="{
      root: {
        class: ['d-flex justify-content-between border-0'],
        style: {
          width: '100%',
          backgroundColor: 'var(--navmenubar-background)',
          color: 'var(--text-primary)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
      start: {
        class: ['ms-3'],
      },
      end: {
        class: ['me-3'],
      },
    }"
  >
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
          <NavBarMainMenu />
          <NavBarProfileAvatar @logout="handleLogout" />
        </div>
      </div>
    </template>
  </Menubar>
</template>

<style></style>
