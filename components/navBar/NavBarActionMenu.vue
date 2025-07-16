<script lang="ts" setup>
import { ref, computed } from "vue";
import { useAuthStore } from "~/stores/auth";
import Notifications from "../notifications/Notifications.vue";
import BarsActions from "./BarsActions.vue";

const showBarsDrawer = ref(false);

const authStore = useAuthStore();
const avatarImage = computed(() => authStore.avatarUrl ?? undefined);
const avatarLabel = computed(() =>
  !authStore.avatarUrl && authStore.username
    ? authStore.username.charAt(0).toUpperCase()
    : ""
);
</script>

<template>
  <Notifications />

  <Avatar
    :image="avatarImage"
    :label="avatarLabel"
    size="large"
    shape="circle"
  />

  <BarsActions />
</template>
