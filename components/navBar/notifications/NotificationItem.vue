<script lang="ts" setup>
import type { Notification } from "~/types/Notification";
import { getNotificationLabel } from "~/types/enums";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { fixed_values, labels } from "~/constants/labels";
import type { Post } from "~/types/Post";
import { useToast } from "primevue/usetoast";
import PostCommentDialog from "~/components/post-comments/PostCommentDialog.vue";

dayjs.extend(utc);

const props = defineProps<{
  notification: Notification;
}>();

const emit = defineEmits<{
  (e: "notification-clicked", notification: Notification): void;
}>();

const postedAgo = computed(() =>
  dayjs.utc(props.notification.createdAt).local().fromNow()
);
const toast = useToast();
const postNotification = ref<Post>({});
const showPostCommentDialog = ref(false);
const loading = useLoadingStore();

const avatarImage = computed(() => props.notification.avatarUrl ?? undefined);

const avatarLabel = computed(() =>
  !props.notification.avatarUrl && props.notification.username
    ? props.notification.username.charAt(0).toUpperCase()
    : ""
);

const onOpenNotification = async () => {
  loading.startLoading();
  try {
    const response = await $fetch<{ success: boolean; post: Post }>(
      `/api/post/${props.notification.postId}`
    );

    if (response.success) {
      postNotification.value = response.post;
      showPostCommentDialog.value = true;
      emit("notification-clicked", props.notification);
    }
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(toast, "warn", "Fetch Notifications Failed", message, 3000);
  } finally {
    loading.stopLoading();
  }
};
</script>

<template>
  <div
    :class="[
      'notification-item flex flex-col p-3 mb-2 relative',
      { read: notification.isRead },
    ]"
    @click="onOpenNotification"
  >
    <!-- Unread Dot Indicator -->
    <div v-if="!notification.isRead" class="dot-indicator"></div>

    <!-- HEADER -->
    <div class="flex items-center mb-2 header">
      <div class="mr-2 flex-shrink-0">
        <Avatar
          :image="avatarImage"
          :label="avatarLabel"
          size="large"
          shape="circle"
        />
      </div>

      <div class="flex flex-col w-full overflow-hidden">
        <div class="flex flex-wrap items-baseline gap-1 username-line">
          <span
            class="username truncate"
            :class="{
              'font-bold': !notification.isRead,
              'font-normal': notification.isRead,
            }"
            :title="notification.username ?? ''"
          >
            {{ notification.username || "Unknown user" }}
          </span>
          <span class="notification-type">
            {{ getNotificationLabel(notification.type) }}
          </span>
        </div>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="notification-description">
      {{
        notification.message.length &&
        notification.message.length >
          fixed_values.MAX_NOTIFICATION_PREVIEW_LENGTH
          ? notification.message.slice(
              0,
              fixed_values.MAX_NOTIFICATION_PREVIEW_LENGTH
            ) + "..."
          : notification.message || "No comment content."
      }}
    </div>

    <!-- FOOTER -->
    <div class="footer mt-2 flex justify-between items-center">
      <span class="postedAgo">
        {{ postedAgo }}
      </span>

      <!-- Mark as Read Button -->
      <Button
        v-if="!notification.isRead"
        :label="labels.MARK_AS_READ"
        icon="pi pi-check"
        variant="text"
        severity="info"
        size="small"
        @click.stop="emit('notification-clicked', props.notification)"
      />
    </div>
  </div>

  <PostCommentDialog
    v-if="showPostCommentDialog"
    v-model:showPostCommentDialog="showPostCommentDialog"
    :post="postNotification"
  />
</template>

<style scoped>
.notification-item {
  background-color: var(--bg-post);
  border-radius: 12px;
  transition: box-shadow 0.2s ease, background-color 0.2s ease, border 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;
  position: relative;
}

.notification-item.read {
  background-color: var(--bg-post-read, #2e2e2e);
  opacity: 0.85;
}

.notification-item:hover {
  box-shadow: 0 4px 12px var(--shadow-hover);
  background-color: var(--background-hover);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Unread dot indicator */
.dot-indicator {
  width: 10px;
  height: 10px;
  background-color: var(--primary-color, #1976d2);
  border-radius: 50%;
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
}

.postedAgo {
  font-size: 0.8rem;
}

/* Content */
.notification-description {
  color: var(--text-primary);
  white-space: pre-line;
  line-height: 1.6;
  margin-bottom: 0;
}

/* Footer */
.footer button {
  font-size: 0.75rem;
}

.header {
  max-height: 48px;
  overflow: hidden;
}

.username-line {
  max-height: 48px;
  overflow: hidden;
}

.username {
  min-width: 0;
  max-width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.notification-type {
  white-space: nowrap;
  flex-shrink: 0;
  color: var(--text-color);
  font-size: 0.875rem;
}
</style>
