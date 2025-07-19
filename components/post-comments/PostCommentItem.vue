<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Comment } from "~/types/Post";
import { buttons, fixed_values, labels } from "~/constants/labels";
import { autoLinkText } from "~/composables/useAutoLink";
import { UserRole } from "~/types/enums";

dayjs.extend(relativeTime);

const props = defineProps<{ comment: Comment; postUserId: string }>();
const emits = defineEmits(["comment-deleted"]);

const authStore = useAuthStore();
const toast = useToast();
const confirm = useConfirm();

const expandedComments = ref<number[]>([]);

const editing = ref(false);
const editContent = ref(props.comment.content);
const commentMenu = ref();

function isExpanded(id: number) {
  return expandedComments.value.includes(id);
}

function toggleExpand(id: number) {
  if (isExpanded(id)) {
    expandedComments.value = expandedComments.value.filter((i) => i !== id);
  } else {
    expandedComments.value.push(id);
  }
}

const commentUpdated = async () => {
  if (!editContent.value || !editContent.value.trim()) {
    return;
  }

  try {
    const response = await $fetch<{ success: boolean }>(
      `/api/comment/${props.comment.id}`,
      {
        method: "PUT",
        body: {
          content: editContent.value,
          id: props.comment.id,
        },
      }
    );

    if (response.success) {
      notifications(toast, "success", "Comment updated");
      props.comment.content = editContent.value;
      editing.value = false;
    } else {
      throw new Error("Failed to update comment...");
    }
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(toast, "warn", "Update Comment Failed", message, 3000);
  }
};

const safeContent = computed(() => {
  const desc = props.comment.content ?? "";
  const truncated =
    isExpanded(props.comment.id as number) || desc.length <= 100
      ? desc
      : desc.slice(0, 100) + "...";

  return autoLinkText(truncated);
});

const toggleCommentMenu = (event: Event) => {
  commentMenu.value.toggle(event);
};

const editCommentItems = computed(() => {
  const menu: any[] = [];

  if (
    authStore.userId === props.comment.user.id ||
    authStore.userRole === UserRole.admin
  ) {
    menu.push({
      label: "Edit",
      icon: "pi pi-pencil",
      command: () => {
        editContent.value = props.comment.content;
        editing.value = true;
      },
    });

    menu.push({ separator: true });
  }

  if (
    authStore.userId === props.comment.user.id ||
    authStore.userRole === UserRole.admin ||
    authStore.userId === props.postUserId
  ) {
    menu.push({
      label: "Delete",
      icon: "pi pi-trash",
      command: confirmDelete,
    });
  }
  return menu;
});

const confirmDelete = () => {
  confirm.require({
    message: "Are you sure you want to delete this comment?",
    header: "Confirm Delete",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "No",
    },
    accept: () => emits("comment-deleted"),
  });
};
</script>

<template>
  <div class="d-flex mb-3 p-3 rounded shadow-sm comment-item">
    <!-- Avatar -->
    <Avatar
      class="me-3"
      shape="circle"
      style="min-width: 40px; min-height: 40px; background-color: #e2e8f0"
    >
      <template #default>
        <img
          v-if="comment.user.avatarUrl"
          :src="comment.user.avatarUrl"
          alt="avatar"
          class="avatar-img"
        />
        <strong v-else>
          {{ comment.user.username?.charAt(0).toUpperCase() }}
        </strong>
      </template>
    </Avatar>

    <!-- Content -->
    <div class="flex-grow-1">
      <div class="d-flex justify-content-between align-items-center">
        <p class="fw-bold mb-0">
          {{ comment.user.username }}
        </p>

        <div class="d-flex align-items-center gap-1">
          <small>{{ dayjs(comment.createdAt).fromNow() }}</small>

          <Button
            v-if="
              authStore.userId === comment.user.id ||
              authStore.userRole === UserRole.admin ||
              authStore.userId === props.postUserId
            "
            icon="pi pi-ellipsis-v"
            variant="text"
            size="small"
            aria-haspopup="true"
            aria-controls="overlay_menu"
            @click="toggleCommentMenu"
          />

          <Menu
            ref="commentMenu"
            id="overlay_menu"
            :model="editCommentItems"
            :popup="true"
          />
        </div>
      </div>

      <!-- Normal View -->
      <div v-if="!editing" class="comment-content mb-1">
        <div v-html="safeContent" />
      </div>

      <!-- Edit Mode -->
      <div v-else class="d-flex flex-column gap-2">
        <div class="position-relative d-flex w-100">
          <!-- Textarea: full width on mobile, shared row with avatar on desktop -->
          <Textarea
            v-model="editContent"
            rows="1"
            autoResize
            class="flex-grow-1 w-100"
            :maxlength="fixed_values.COMMENT_MAX_TEXT_LENGTH"
            :placeholder="labels.COMMENT_PLACEHOLDER"
          />

          <span class="char-counter">
            {{ editContent?.length ?? 0 }}/{{
              fixed_values.COMMENT_MAX_TEXT_LENGTH
            }}
          </span>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <Button
            icon="pi pi-check"
            :label="buttons.SAVE"
            size="small"
            @click="commentUpdated"
          />
          <Button
            icon="pi pi-times"
            :label="buttons.CANCEL"
            severity="secondary"
            size="small"
            @click="editing = false"
          />
        </div>
      </div>

      <div class="d-flex justify-content-end">
        <Button
          v-if="comment.content.length > 100 && !editing"
          variant="link"
          size="small"
          @click="toggleExpand(comment.id)"
        >
          {{ isExpanded(comment.id) ? "Show Less" : "Show More" }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-item {
  background-color: var(--bg-comments);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.comment-content {
  font-size: 1rem;
  line-height: 1.4;
  color: var(--text-color);
  word-wrap: break-word;
  white-space: normal;
}

.comment-content.collapsed {
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 40px;
  white-space: nowrap;
}

.comment-content.expanded {
  max-height: none;
}
</style>
