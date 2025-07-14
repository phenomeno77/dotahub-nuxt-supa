<script lang="ts" setup>
import type { Post, Comment } from "~/types/Post";
import { labels } from "~/constants/labels";
import PostCommentsList from "./PostCommentsList.vue";
import PostItemCommentDialog from "./PostItemCommentDialog.vue";

const props = defineProps<{ post: Post }>();

const avatarImage = computed(() => props.post.user?.avatarUrl || undefined);
const showPostCommentDialog = defineModel("showPostCommentDialog", {
  type: Boolean,
  default: false,
});
const { loggedIn } = useUserSession();
const comment = ref("");
// const comments = ref<Comment[]>([]);
const COMMENTS_PER_PAGE = 5;
const dialogContentRef = ref<HTMLElement | null>(null);

const {
  items: comments,
  total,
  isLoading,
  fetchInitial,
  fetchMore,
} = usePaginatedFetch<Comment>(
  `/api/comment?postId=${props.post.id}`,
  COMMENTS_PER_PAGE
);

const avatarLabel = computed(() =>
  !props.post.user?.avatarUrl && props.post.user?.username
    ? props.post.user.username.charAt(0).toUpperCase()
    : undefined
);

const abortPost = () => {
  comment.value = "";
};

const addComment = async () => {
  if (!comment.value || !comment.value.trim()) {
    return;
  }

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

      comments.value.unshift(newComment);
      comment.value = "";
    } else {
      throw new Error("Failed to Comment...please try again later");
    }
  } catch (error: any) {
    console.error(
      error.message || "An error occurred while submitting the comment."
    );
  }
};

const dialogStyle = computed(() => ({
  width: "90vw",
  maxWidth: "860px",
  height: "100%",
}));

onMounted(async () => {
  await fetchInitial();

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
        canLoadMore: () =>
          comments.value.length < total.value && !isLoading.value,
      }
    );
  }
});
</script>

<template>
  <Dialog
    v-model:visible="showPostCommentDialog"
    modal
    :header="`Post from ${props.post.user?.username}`"
    :style="dialogStyle"
    :contentStyle="{ height: '100%', padding: '0' }"
    :pt="{
      root: {
        style: {
          background: 'var(--background-color)',
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

      <PostCommentsList
        v-if="props.post.id !== undefined"
        :comments="comments"
        :isLoading="isLoading"
        :skeletonCount="COMMENTS_PER_PAGE"
      />
    </div>

    <template #footer>
      <div v-if="loggedIn" class="w-100">
        <div
          class="d-flex align-items-start w-100 flex-wrap gap-2"
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

          <!-- Textarea: full width on mobile, shared row with avatar on desktop -->
          <Textarea
            v-model="comment"
            rows="1"
            autoResize
            class="flex-grow-1"
            :placeholder="labels.COMMENT_PLACEHOLDER"
          />

          <!-- Buttons: always on new row, right-aligned -->
          <div class="d-flex justify-content-end gap-2 w-100">
            <Button
              icon="pi pi-times"
              variant="text"
              severity="danger"
              v-tooltip.bottom="{
                value: labels.POST_ABORT,
                showDelay: 500,
                hideDelay: 300,
              }"
              @click="abortPost"
            />
            <Button
              icon="pi pi-send"
              variant="text"
              v-tooltip.bottom="{
                value: labels.COMMENT_SUBMIT,
                showDelay: 500,
                hideDelay: 300,
              }"
              @click="addComment"
            />
          </div>
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
