<script lang="ts" setup>
import type { Notification } from "~/types/Notification";
import { getNotificationLabel } from "~/types/enums";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { fixed_values, labels } from "~/constants/labels";
import type { Post } from "~/types/Post";
import { useToast } from "primevue/usetoast";
import PostCommentDialog from "../post-comments/PostCommentDialog.vue";

dayjs.extend(relativeTime);

const props = defineProps<{
  notification: Notification;
}>();

const emit = defineEmits<{
  (e: "notification-clicked", notification: Notification): void;
}>();

const postedAgo = computed(() => dayjs(props.notification.createdAt).fromNow());
const toast = useToast();
const postNotification = ref<Post>({});
const showPostCommentDialog = ref(false);

const avatarImage = computed(
  () => props.notification.comment?.user.avatarUrl ?? undefined
);
const avatarLabel = computed(() =>
  !props.notification.comment?.user.avatarUrl &&
  props.notification.comment?.user.username
    ? props.notification.comment?.user.username.charAt(0).toUpperCase()
    : ""
);

const onOpenNotification = async () => {
  try {
    const response = await $fetch<{ success: boolean; post: Post }>(
      `/api/post/${props.notification.post?.id}`
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
  }
};
</script>

<template>
  <div
    :class="[
      'notification-item d-flex flex-column p-3 mb-2 position-relative',
      { read: notification.isRead },
    ]"
    @click="onOpenNotification"
  >
    <!-- Unread Dot Indicator -->
    <div v-if="!notification.isRead" class="dot-indicator"></div>

    <!-- HEADER -->
    <div class="d-flex align-items-center mb-2 header">
      <div class="me-2 flex-shrink-0">
        <Avatar
          :image="avatarImage"
          :label="avatarLabel"
          size="large"
          shape="circle"
        />
      </div>

      <div class="d-flex flex-column w-100 overflow-hidden">
        <div class="d-flex flex-wrap align-items-baseline gap-1 username-line">
          <span
            class="username text-truncate"
            :class="{
              'fw-bold': !notification.isRead,
              'fw-normal': notification.isRead,
            }"
            :title="notification.comment?.user.username ?? ''"
          >
            {{ notification.comment?.user.username || "Unknown user" }}
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
        notification.comment?.content?.length &&
        notification.comment?.content?.length >
          fixed_values.MAX_NOTIFICATION_PREVIEW_LENGTH
          ? notification.comment.content.slice(
              0,
              fixed_values.MAX_NOTIFICATION_PREVIEW_LENGTH
            ) + "..."
          : notification.comment?.content || "No comment content."
      }}
    </div>

    <!-- FOOTER -->
    <div class="footer mt-2 d-flex justify-content-between align-items-center">
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
