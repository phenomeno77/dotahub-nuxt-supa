<script lang="ts" setup>
import type { Post, Comment } from "~/types/Post";
import { labels, fixed_values, buttons } from "~/constants/labels";
import PostCommentsList from "./PostCommentsList.vue";
import PostItemCommentDialog from "./PostItemCommentDialog.vue";
import { useToast } from "primevue/usetoast";
import notifications from "~/utils/notifications";
import { useAuthStore } from "~/stores/auth";
import { useRealtimePostComments } from "~/composables/useRealtimePostComments";

const props = defineProps<{ post: Post }>();
const emits = defineEmits([
  "comment-deleted",
  "increment-comment-count",
  "update-comment-count",
]);

const showPostCommentDialog = defineModel("showPostCommentDialog", {
  type: Boolean,
  default: false,
});
const toast = useToast();
const { user: currentUser, loggedIn } = useUserSession();
const comment = ref("");
const dialogContentRef = ref<HTMLElement | null>(null);
const authStore = useAuthStore();
const addingComment = ref(false);
const loadNewestComments = ref(false);

const {
  items: comments,
  total,
  isLoadingInit,
  isLoadingMore,
  fetchInitial,
  fetchMore,
} = usePaginatedFetch<Comment>(
  `/api/comment?postId=${props.post.id}`,
  fixed_values.COMMENTS_PER_PAGE
);

const avatarLabel = computed(() =>
  !authStore?.avatarUrl && authStore?.username
    ? authStore.username.charAt(0).toUpperCase()
    : ""
);

const avatarImage = computed(() => authStore.avatarUrl ?? undefined);

const commentDeleted = async (comment: Comment) => {
  try {
    const response = await $fetch<{ success: boolean }>(
      `/api/comment/${comment.id}`,
      {
        method: "DELETE",
      }
    );
    if (response.success) {
      notifications(toast, "success", "Comment deleted successfully");
      comments.value = comments.value.filter((c) => c.id !== comment.id);
      total.value--;
      emits("comment-deleted");
    } else {
      throw new Error("Failed to remove comment...");
    }
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(toast, "warn", "Delete Comment Failed", message, 3000);
  }
};

const addComment = async () => {
  if (!comment.value || !comment.value.trim()) {
    return;
  }
  addingComment.value = true;

  try {
    const response = await $fetch("/api/comment", {
      method: "POST",
      body: {
        comment: comment.value,
        postId: props.post.id,
      },
    });

    if (response.success) {
      const newComment = {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
      };
      total.value++;
      comments.value.unshift(newComment);
      comment.value = "";
    } else {
      throw new Error("Failed to Comment...please try again later");
    }
  } catch (error: any) {
    console.error(
      error.message || "An error occurred while submitting the comment."
    );
  } finally {
    addingComment.value = false;
  }
};

const reloadNewComments = async () => {
  await fetchInitial();
  loadNewestComments.value = false;
};

const dialogStyle = computed(() => ({
  width: "90vw",
  maxWidth: "960px",
  height: "calc(100dvh - 120px)",
  top: "80px",
  bottom: "40px",
  position: "absolute",
  margin: "0px",
}));

let unsubscribeComments: () => Promise<void>;

onMounted(async () => {
  try {
    await fetchInitial();
    emits("update-comment-count", total.value);
    await nextTick();

    if (dialogContentRef.value) {
      useInfiniteScroll(
        dialogContentRef,
        async () => {
          if (comments.value.length < total.value) {
            await fetchMore();
          }
        },
        {
          distance: 20,
          canLoadMore: () => comments.value.length < total.value,
        }
      );
    }

    if (currentUser.value) {
      unsubscribeComments = useRealtimePostComments((comment) => {
        if (showPostCommentDialog.value) {
          emits("increment-comment-count");
        }
        if (
          comment.userId !== currentUser.value?.id &&
          showPostCommentDialog.value
        ) {
          loadNewestComments.value = true;
          emits("increment-comment-count");
        }
      });
    }
  } catch (err) {
    console.error("Error in onMounted:", err);
  }
});

onUnmounted(() => {
  if (unsubscribeComments) unsubscribeComments();
});
</script>

<template>
  <Dialog
    v-model:visible="showPostCommentDialog"
    modal
    position="bottom"
    :draggable="false"
    dismissableMask
    :header="`Post from ${props.post.user?.username}`"
    :style="dialogStyle"
    :contentStyle="{ height: '100%', padding: '0' }"
    :pt="{
      root: {
        style: {
          background: 'var(--bg-post)',
          color: 'var(--text-color)',
          border: 'none',
        },
      },
    }"
  >
    <!-- Scroll container wrapping entire dialog content -->
    <div
      ref="dialogContentRef"
      class="d-flex flex-column h-100 overflow-auto px-3"
    >
      <PostItemCommentDialog :post="props.post" />

      <div
        v-if="loadNewestComments"
        class="mb-3 d-flex w-100 justify-content-center"
      >
        <Button
          @click="reloadNewComments"
          severity="info"
          icon="pi pi-refresh"
          variant="text"
          :label="buttons.LOAD_NEW_COMMENTS"
        />
      </div>

      <PostCommentsList
        v-if="props.post.id !== undefined"
        :comments="comments"
        :postUserId="props.post.user?.id ?? ''"
        :isLoadingInit="isLoadingInit"
        :isLoadingMore="isLoadingMore"
        v-model:addingComment="addingComment"
        :skeletonCount="fixed_values.COMMENTS_PER_PAGE"
        @comment-deleted="commentDeleted"
      />
    </div>

    <template #footer>
      <div v-if="loggedIn" class="w-100">
        <div
          class="d-flex align-items-center justify-content-start w-100 gap-2"
          style="padding: 0.5rem 0"
        >
          <!-- Avatar: only visible on sm+ (desktop), inline with textarea -->
          <div class="d-none d-sm-flex align-items-center">
            <Avatar
              :image="avatarImage"
              :label="avatarLabel"
              shape="circle"
              size="large"
              class="fixed-avatar"
            />
          </div>

          <div class="position-relative d-flex w-100">
            <!-- Textarea: full width on mobile, shared row with avatar on desktop -->
            <Textarea
              v-model="comment"
              rows="1"
              autoResize
              class="flex-grow-1 w-100"
              :placeholder="labels.COMMENT_PLACEHOLDER"
              :maxlength="fixed_values.COMMENT_MAX_TEXT_LENGTH"
            />

            <span class="char-counter">
              {{ comment?.length ?? 0 }}/{{
                fixed_values.COMMENT_MAX_TEXT_LENGTH
              }}
            </span>
          </div>
          <!-- Buttons: always on new row, right-aligned -->
        </div>
        <div class="d-flex justify-content-end gap-2">
          <Button
            icon="pi pi-send"
            variant="text"
            v-tooltip.bottom="{
              value: labels.COMMENT_SUBMIT,
              showDelay: 500,
              hideDelay: 300,
            }"
            @click="addComment()"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.fixed-avatar {
  flex-shrink: 0;
  flex-grow: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
}
</style>
