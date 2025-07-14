<script lang="ts" setup>
import type { Post, Comment } from "~/types/Post";
import dayjs from "dayjs";
import { labels } from "~/constants/labels";
import PostCommentsList from "./PostCommentsList.vue";

const props = defineProps<{ post: Post }>();
const avatarImage = computed(() => props.post.user?.avatarUrl || undefined);
const showPostCommentDialog = defineModel("showPostCommentDialog", {
  type: Boolean,
  default: false,
});
const expandedPosts = ref<number[]>([]);
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

const positionLabels: Record<string, string> = {
  carry: "Carry",
  mid: "Mid",
  offlane: "Offlane",
  soft_support: "Soft Support",
  hard_support: "Hard Support",
};

const avatarLabel = computed(() =>
  !props.post.user?.avatarUrl && props.post.user?.username
    ? props.post.user.username.charAt(0).toUpperCase()
    : undefined
);

const postedAgo = computed(() => {
  return dayjs(props.post.createdAt).fromNow(); // e.g. "2 hours ago"
});

const getPositionIcon = (position: string) => {
  switch (position.toLowerCase()) {
    case "carry":
      return "pi pi-bolt";
    case "mid":
      return "pi pi-bullseye";
    case "offlane":
      return "pi pi-shield";
    case "soft_support":
      return "pi pi-users";
    case "hard_support":
      return "pi pi-heart";
    default:
      return "pi pi-user";
  }
};

function isPostExpanded(id: number) {
  return expandedPosts.value.includes(id);
}

function togglePostExpand(id: number) {
  if (isPostExpanded(id)) {
    expandedPosts.value = expandedPosts.value.filter((i) => i !== id);
  } else {
    expandedPosts.value.push(id);
  }
}

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
      <div class="post-item mb-4 px-3 pt-3">
        <!-- Header -->
        <div
          class="d-flex justify-content-between align-items-center mb-3 w-100"
        >
          <div class="d-flex align-items-center">
            <Avatar
              :image="avatarImage"
              :label="avatarLabel"
              class="me-2"
              size="xlarge"
              shape="circle"
            />
            <div>
              <p class="mb-0 fw-bold username">
                {{ props.post.user?.username }}
                <i
                  v-if="props.post.user?.isPremium"
                  class="pi pi-crown me-1 premium-badge mb-0"
                  title="Premium member"
                ></i>
              </p>

              <small class="postedAgo">Posted {{ postedAgo }}</small>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div>
          <div
            :class="[
              'post-description-wrapper',
              { 'expandable-description': isPostExpanded(props.post.id as number) }
            ]"
          >
            <p class="post-description">
              {{
                isPostExpanded(props.post.id as number)
                  ? props.post.description ?? ""
                  : (props.post.description ?? "").slice(0, 300) +
                    ((props.post.description?.length ?? 0) > 300 ? "..." : "")
              }}
            </p>
          </div>

          <div class="d-flex justify-content-end">
            <Button
              v-if="
                (props.post.description?.length ?? 0) > 255 &&
                props.post.id !== undefined
              "
              variant="link"
              @click="togglePostExpand(props.post.id as number)"
            >
              {{
                isPostExpanded(props.post.id as number)
                  ? "Show Less"
                  : "Show More"
              }}
            </Button>
          </div>
        </div>

        <!-- Rank Row -->
        <div class="pb-2">
          <div class="rank-box d-flex align-items-center p-2 gap-1">
            <i class="pi pi-star-fill" style="color: silver" />
            <span class="rank-text">{{ props.post.minRank }}</span>
            <span class="mx-1">to</span>
            <span class="rank-text">{{ props.post.maxRank }}</span>
          </div>
        </div>

        <!-- Positions Row -->
        <div class="pb-2">
          <div class="position-box">
            <p class="mb-2 fw-bold text-white">{{ labels.LOOKING_FOR }}</p>
            <div class="d-flex flex-wrap gap-2">
              <div
                v-for="position in props.post.positionsNeeded"
                :key="position"
                class="position-pill"
              >
                <i :class="getPositionIcon(position)" class="me-1" />
                {{ positionLabels[position] }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PostCommentsList
        v-if="props.post.id !== undefined"
        :comments="comments"
        :isLoading="isLoading"
        :skeletonCount="COMMENTS_PER_PAGE"
      />
    </div>

    <template #footer>
      <div v-if="loggedIn" class="w-100 px-1">
        <div
          class="d-flex align-items-center w-100 gap-2"
          style="padding: 0.5rem 0"
        >
          <!-- Avatar -->
          <Avatar
            :image="avatarImage"
            :label="avatarLabel"
            size="large"
            shape="circle"
          />

          <!-- Textarea -->
          <Textarea
            v-model="comment"
            rows="1"
            autoResize
            class="flex-grow-1"
            :placeholder="labels.COMMENT_PLACEHOLDER"
          />

          <!-- Buttons container -->
          <div class="d-flex gap-1">
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

<style></style>
