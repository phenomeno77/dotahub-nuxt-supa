<script lang="ts" setup>
import { computed } from "vue";
import { useAuthStore } from "~/stores/auth";
import NotificationsList from "../notifications/NotificationsList.vue";
import BarsActions from "./BarsActions.vue";

const authStore = useAuthStore();
const avatarImage = computed(() => authStore.avatarUrl ?? undefined);
const avatarLabel = computed(() =>
  !authStore.avatarUrl && authStore.username
    ? authStore.username.charAt(0).toUpperCase()
    : ""
);
</script>

<template>
  <NotificationsList />

  <Avatar
    :image="avatarImage"
    :label="avatarLabel"
    size="large"
    shape="circle"
  />

  <BarsActions />
</template>
