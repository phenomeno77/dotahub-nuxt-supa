<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Comment } from "~/types/Post";
import { buttons, fixed_values, labels } from "~/constants/labels";
import { autoLinkText } from "~/composables/useAutoLink";
import { UserRole } from "~/types/enums";

dayjs.extend(relativeTime);

const props = defineProps<{ comment: Comment; postUserPublicId: string }>();
const emits = defineEmits(["comment-deleted"]);

const { loggedIn, user: currentUser } = useUserSession();
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
    currentUser.value.publicId === props.comment.user.publicId ||
    currentUser.value.role === UserRole.admin
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
    currentUser.value.publicId === props.comment.user.publicId ||
    currentUser.value.role === UserRole.admin ||
    currentUser.value.publicId === props.postUserPublicId
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
const avatarImage = computed(() => props.comment.user?.avatarUrl || undefined);
const avatarLabel = computed(() =>
  !props.comment.user?.avatarUrl && props.comment.user?.username
    ? props.comment.user.username.charAt(0).toUpperCase()
    : undefined
);
</script>

<template>
  <Card
    style="width: 100%; overflow: hidden; background-color: var(--bg-comments)"
    :pt="{
      body: {
        style: { padding: '10px' },
      },
      title: {
        style: { fontWeight: '600', fontSize: '18px' },
      },
    }"
  >
    <template #title
      ><!-- HEADER -->
      <div class="d-flex justify-content-between align-items-center mb-2 px-1">
        <!-- Avatar + Username + Timestamp -->
        <div class="d-flex align-items-center overflow-hidden">
          <Avatar
            :image="avatarImage"
            :label="avatarLabel"
            class="me-2 flex-shrink-0"
            size="large"
            shape="circle"
          />
          <div
            style="max-width: 400px"
            class="d-flex flex-column overflow-hidden"
          >
            <p
              class="mb-0 fw-bold d-flex align-items-center"
              :title="comment.user?.username ?? ''"
            >
              <template v-if="loggedIn">
                <a
                  :href="`/profile/${comment.user?.publicId}`"
                  class="text-truncate username"
                  style="
                    max-width: 400px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  {{ comment.user?.username }}
                </a>
              </template>

              <template v-else>
                <span
                  class="text-truncate"
                  style="
                    max-width: 400px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  {{ comment.user?.username }}
                </span>
              </template>
            </p>

            <small class="postedAgo"
              >Posted {{ dayjs(comment.createdAt).fromNow() }}</small
            >
          </div>
        </div>

        <!-- Menu Button -->
        <div
          v-if="
            currentUser.publicId === comment.user.publicId ||
            currentUser.role === UserRole.admin ||
            currentUser.publicId === props.postUserPublicId
          "
          class="d-flex align-items-center gap-1 flex-shrink-0"
        >
          <Button
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
        </div></div
    ></template>
    <template #content>
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

      <!-- Expand/Collapse -->
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
    </template>
  </Card>
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
