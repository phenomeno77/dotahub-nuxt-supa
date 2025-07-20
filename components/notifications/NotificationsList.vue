<script lang="ts" setup>
import { labels } from "~/constants/labels";
import type { Notification } from "~/types/Notification";

const showNotificationsDrawer = ref(false);
const notifications = ref<Notification[]>([]);

const fetchNotifications = async () => {};

onMounted(async () => {
  await fetchNotifications();
});
</script>

<template>
  <OverlayBadge value="2" severity="danger">
    <Button
      size="large"
      severity="secondary"
      icon="pi pi-bell"
      rounded
      @click="showNotificationsDrawer = true"
    />

    <Drawer
      v-model:visible="showNotificationsDrawer"
      position="right"
      :pt="{
        root: {
          style: {
            background: 'var(--background-color)',
            color: 'var(--text-color)',
            border: 'none',
            width: '400px',
          },
        },
      }"
    >
      <template #header>
        <span class="fw-semibold fs-4">{{ labels.NOTIFICATIONS }}</span>
      </template>
    </Drawer>
  </OverlayBadge>
</template>

<style></style>
