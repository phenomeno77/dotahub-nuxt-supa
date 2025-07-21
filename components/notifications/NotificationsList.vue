<script lang="ts" setup>
import { labels } from "~/constants/labels";
import type { Notification } from "~/types/Notification";
import { useToast } from "primevue/usetoast";
import NotificationItem from "./NotificationItem.vue";
import NotificationItemSkeleton from "./NotificationItemSkeleton.vue";

const showNotificationsDrawer = ref(true);
const notificationList = ref<Notification[]>([]);
const toast = useToast();
const isLoading = ref(false);

const fetchNotifications = async () => {
  isLoading.value = true;
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
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }
};

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.isRead) {
    try {
      const res = await $fetch<{ success: boolean }>(
        `/api/notification/${notification.id}/mark-read`,
        {
          method: "PUT",
        }
      );

      if (res.success) {
        // Update local state to reflect change
        const target = notificationList.value.find(
          (n) => n.id === notification.id
        );
        if (target) {
          target.isRead = true;
        }
      }
    } catch (error: any) {
      const message =
        error?.response?._data?.statusMessage ||
        error.statusMessage ||
        error.message ||
        "Unexpected error";

      notifications(
        toast,
        "warn",
        "Failed to mark notification as read",
        message,
        3000
      );
    }
  }
};

const unreadCount = computed(
  () => notificationList.value.filter((n) => !n.isRead).length
);

const onOpenDrawer = async () => {
  showNotificationsDrawer.value = true;
  await fetchNotifications();
};

const onHideDrawer = async () => {
  try {
    // Call API to delete read notifications from DB
    const res = await $fetch<{ success: boolean }>(
      "/api/notification/delete-read",
      {
        method: "DELETE",
      }
    );
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(
      toast,
      "warn",
      "Failed to remove read notifications",
      message,
      3000
    );
  }
};

const markAllAsRead = async () => {
  try {
    const res = await $fetch<{ success: boolean }>(
      "/api/notification/mark-all-read",
      {
        method: "PUT",
      }
    );

    if (res.success) {
      notificationList.value = notificationList.value.map((n) => ({
        ...n,
        isRead: true,
      }));
    }
  } catch (error) {
    useToast().add({
      severity: "error",
      summary: "Failed to mark all as read",
      detail: "Please try again later.",
      life: 3000,
    });
  }
};

const allRead = computed(() => notificationList.value.every((n) => n.isRead));

onMounted(async () => {
  await fetchNotifications();
});
</script>

<template>
  <OverlayBadge v-if="unreadCount > 0" :value="unreadCount" severity="danger">
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
    @after-hide="onHideDrawer"
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

    <NotificationItemSkeleton v-if="isLoading" v-for="n in 5" :key="n" />

    <!-- Empty state -->
    <div
      v-else-if="notificationList.length === 0 && !isLoading"
      class="text-center p-4"
    >
      <i class="pi pi-bell fs-2 mb-2 d-block"></i>
      <p class="mb-0">You're all caught up!</p>
      <small>No new notifications at the moment.</small>
    </div>

    <!-- Button + Notification list -->
    <div v-else>
      <!-- Mark All as Read button (above list) -->
      <div class="d-flex justify-content-end w-100 mb-3">
        <Button
          v-if="!allRead"
          :label="labels.MARK_ALL_AS_READ"
          icon="pi pi-check"
          variant="text"
          severity="info"
          size="small"
          @click="markAllAsRead"
        />
      </div>

      <!-- List of Notifications -->
      <NotificationItem
        v-for="notification in notificationList"
        :key="notification.id"
        :notification="notification"
        @notification-clicked="handleNotificationClick"
      />
    </div>
  </Drawer>
</template>

<style></style>
