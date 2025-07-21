<script lang="ts" setup>
import type { Notification } from "~/types/Notification";
import { getNotificationLabel } from "~/types/enums";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { fixed_values } from "~/constants/labels";

dayjs.extend(relativeTime);

const props = defineProps<{
  notification: Notification;
}>();

const postedAgo = computed(() => dayjs(props.notification.createdAt).fromNow());

const avatarImage = computed(
  () => props.notification.comment?.user.avatarUrl ?? undefined
);
const avatarLabel = computed(() =>
  !props.notification.comment?.user.avatarUrl &&
  props.notification.comment?.user.username
    ? props.notification.comment?.user.username.charAt(0).toUpperCase()
    : ""
);
</script>

<template>
  <div class="notification-item d-flex flex-column p-3 mb-2">
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
            class="username fw-bold text-truncate"
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
    <div class="footer mt-2 d-flex justify-content-end align-items-center">
      <span class="postedAgo">
        {{ postedAgo }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.notification-item {
  background-color: var(--bg-post);
  border-radius: 12px;
  transition: box-shadow 0.2s ease;
  cursor: pointer;
}

.notification-item:hover {
  box-shadow: 0 4px 12px var(--shadow-hover);
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
  line-height: 1.2;
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
