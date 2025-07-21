<script lang="ts" setup>
import { labels } from "~/constants/labels";
import type { Notification } from "~/types/Notification";
import { useToast } from "primevue/usetoast";
import NotificationItem from "./NotificationItem.vue";

const showNotificationsDrawer = ref(true);
const notificationList = ref<Notification[]>([]);
const toast = useToast();

const fetchNotifications = async () => {
  try {
    const res = await $fetch<{
      success: boolean;
      notifications: Notification[];
    }>("/api/notification");
    if (res.success) {
      notificationList.value = res.notifications;
    }
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";
    notifications(toast, "warn", "Loading Notifications Failed", message, 3000);
  } finally {
  }
};

const onOpenDrawer = async () => {
  showNotificationsDrawer.value = true;
  await fetchNotifications();
};

onMounted(async () => {
  await fetchNotifications();
});
</script>

<template>
  <OverlayBadge
    v-if="notificationList.length > 0"
    :value="notificationList.length"
    severity="danger"
  >
    <Button
      size="large"
      severity="secondary"
      icon="pi pi-bell"
      rounded
      @click="onOpenDrawer"
    />
  </OverlayBadge>

  <Button
    v-else
    size="large"
    severity="secondary"
    icon="pi pi-bell"
    rounded
    @click="onOpenDrawer"
  />

  <Drawer
    v-model:visible="showNotificationsDrawer"
    position="right"
    :pt="{
      root: {
        class: 'drawer-main',
      },
    }"
  >
    <template #header>
      <span class="fw-semibold fs-4">{{ labels.NOTIFICATIONS }}</span>
    </template>

    <!-- Empty state -->
    <div v-if="notificationList.length === 0" class="text-center p-4">
      <i class="pi pi-bell fs-2 mb-2 d-block"></i>
      <p class="mb-0">You're all caught up!</p>
      <small>No new notifications at the moment.</small>
    </div>

    <!-- Notification items -->
    <div v-else v-for="notification in notificationList" :key="notification.id">
      <NotificationItem :notification="notification" />
    </div>
  </Drawer>
</template>

<style></style>
