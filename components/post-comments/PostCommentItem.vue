<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Comment } from "~/types/Post";

dayjs.extend(relativeTime);

const props = defineProps<{ comment: Comment }>();
const emit = defineEmits<{ (e: "deleted", id: number): void }>();

const authStore = useAuthStore();
const toast = useToast();
const confirm = useConfirm();

const isExpanded = ref(false);
const editing = ref(false);
const editContent = ref(props.comment.content);

const toggleExpand = () => (isExpanded.value = !isExpanded.value);

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
    <Avatar class="me-3" shape="circle">
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
      <div class="d-flex justify-content-between">
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
            @click="confirmDelete"
            size="small"
          />
        </div>
      </div>

      <div v-if="!editing">
        <p
          class="comment-content mb-1"
          :class="{ 'text-truncate': !isExpanded }"
        >
          {{ comment.content }}
        </p>
        <Button
          v-if="comment.content.length > 100"
          variant="link"
          @click="toggleExpand"
          size="small"
        >
          {{ isExpanded ? "Show Less" : "Show More" }}
        </Button>
        <Button
          v-if="authStore.userId === comment.user.id"
          icon="pi pi-pencil"
          label="Edit"
          size="small"
          text
          @click="
            () => {
              editContent = comment.content;
              editing = true;
            }
          "
        />
      </div>

      <div v-else class="d-flex flex-column gap-2">
        <Textarea v-model="editContent" autoResize rows="2" />
        <div class="d-flex justify-content-end gap-2">
          <Button
            icon="pi pi-check"
            label="Save"
            size="small"
            @click="saveEdit"
          />
          <Button
            icon="pi pi-times"
            label="Cancel"
            size="small"
            severity="secondary"
            @click="editing = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-item {
  background-color: var(--bg-comments);
}
.avatar-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
}
</style>
