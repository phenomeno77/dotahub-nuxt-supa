<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Comment } from "~/types/Post";
import { buttons } from "~/constants/labels";

dayjs.extend(relativeTime);

const props = defineProps<{ comment: Comment }>();
const emit = defineEmits<{ (e: "deleted", id: number): void }>();

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

const toggleCommentMenu = (event: Event) => {
  commentMenu.value.toggle(event);
};

const saveEdit = async () => {
  try {
    const { data, error } = await useFetch(
      `/api/post/comments/${props.comment.id}`,
      {
        method: "PUT",
        body: { content: editContent.value },
      }
    );

    if (!error.value) {
      props.comment.content = editContent.value;
      editing.value = false;
    } else {
      toast.add({ severity: "warn", summary: "Failed to update comment" });
    }
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error updating comment" });
  }
};

const confirmDelete = () => {
  confirm.require({
    message: "Are you sure you want to delete this comment?",
    header: "Confirm Delete",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "No",
    },
    accept: async () => {
      const { data, error } = await useFetch(
        `/api/post/comments/${props.comment.id}`,
        {
          method: "DELETE",
        }
      );
      if (!error.value) {
        emit("deleted", props.comment.id);
        toast.add({ severity: "success", summary: "Comment deleted" });
      } else {
        toast.add({ severity: "error", summary: "Failed to delete comment" });
      }
    },
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
          <i
            v-if="comment.user.isPremium"
            class="pi pi-crown premium-badge"
            title="Premium member"
          />
        </p>

        <div class="d-flex align-items-center gap-1">
          <small>{{ dayjs(comment.createdAt).fromNow() }}</small>

          <Button
            v-if="
              authStore.userId === comment.user.id ||
              authStore.userRole === 'admin'
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
            :model="[
              {
                label: 'Edit',
                icon: 'pi pi-pencil',
                command: () => {
                  editContent = comment.content;
                  editing = true;
                },
              },
              {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: confirmDelete,
              },
            ]"
            :popup="true"
          />
        </div>
      </div>

      <!-- Normal View -->
      <div v-if="!editing" class="comment-content mb-1">
        {{
          isExpanded(comment.id)
            ? comment.content
            : comment.content.slice(0, 100) +
              (comment.content.length > 100 ? "..." : "")
        }}
      </div>

      <!-- Edit Mode -->
      <div v-else class="d-flex flex-column gap-2">
        <Textarea v-model="editContent" autoResize rows="1" />
        <div class="d-flex justify-content-end gap-2">
          <Button
            icon="pi pi-check"
            :label="buttons.SAVE"
            size="small"
            @click="saveEdit"
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
