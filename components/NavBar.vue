<script lang="ts" setup>
import { NuxtLink } from "#components";
import steamLogo from "~/assets/steam.svg";
import { labels, buttons } from "~/constants/labels";
import ProfileAvatar from "~/components/ProfileAvatar.vue";

const config = useRuntimeConfig();
const appName = config.public.appName;
const { loggedIn } = useUserSession();

const handleLoginSteam = () => {
  // window.location.href = '/auth/steam';
};
</script>

<template>
  <ClientOnly>
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
          >
            <img
              :src="steamLogo"
              alt="Steam Logo"
              class="me-2"
              style="width: 24px; height: 24px"
              @click="handleLoginSteam"
            />
            {{ buttons.SIGN_IN }}
          </Button>

          <!-- <div v-else class="d-flex align-items-center gap-3">
            <ProfileAvatar />
          </div> -->
        </div>
      </template>
    </Menubar>
  </ClientOnly>
</template>

<style></style>
