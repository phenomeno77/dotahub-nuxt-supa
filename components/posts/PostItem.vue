<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "~/stores/auth";
import type { Post } from "~/types/Post";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { buttons, labels } from "~/constants/labels";
// import AddPostComment from "./AddPostComment.vue";
import type { Comment } from "~/types/Post";
import { usePostStore } from "~/stores/posts";
import notifications from "~/utils/notifications";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import UpdatePost from "./UpdatePost.vue";
// import PostComments from "./PostComments.vue";

dayjs.extend(relativeTime);

const props = defineProps<{ post: Post }>();

const { loggedIn } = useUserSession();
const authStore = useAuthStore();
const avatarImage = computed(() => props.post.user?.avatarUrl || undefined);
const showAddComment = ref(false);
const comment = ref<string>("");
const showComments = ref(false);
const comments = ref<Comment[]>([]);
const menu = ref();
const postStore = usePostStore();
const toast = useToast();
const confirm = useConfirm();
const isEditPost = ref(false);
const premiumStore = usePremiumDialog();

const isLoadingMore = ref(false);
const COMMENTS_PER_SCROLL = ref(3);
const postCommentCount = ref<number>(0);

const positionLabels: Record<string, string> = {
  carry: "Carry",
  mid: "Mid",
  offlane: "Offlane",
  soft_support: "Soft Support",
  hard_support: "Hard Support",
};

const toggleShowComments = async () => {
  showComments.value = !showComments.value;

  if (showComments.value) {
    await fetchComments();
  }
};

const fetchComments = async () => {
  // try {
  //   isLoadingMore.value = true;
  //   if (!props.post.id) {
  //     notifications(
  //       toast,
  //       "warn",
  //       "Something went wrong with fetching comments..."
  //     );
  //     return;
  //   }
  //   const response = await api.post.getCommentsByScroll(
  //     props.post.id,
  //     COMMENTS_PER_SCROLL.value,
  //     0
  //   );
  //   if (response.status === "ok") {
  //     comments.value = response.data.comments;
  //   }
  // } catch (error: any) {
  //   notifications(
  //     toast,
  //     "warn",
  //     "Fetching Comments Failed",
  //     error.message,
  //     3000
  //   );
  // } finally {
  //   isLoadingMore.value = false;
  // }
};

const toggleAddComment = () => {
  showComments.value = true;
  showAddComment.value = true;
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

const abortPost = () => {
  showAddComment.value = false;
  comment.value = "";
};

const addComment = async () => {
  // try {
  //   const response = await api.post.addPostComment(
  //     comment.value,
  //     props.post.id!
  //   );
  //   if (response.status === "ok") {
  //     showAddComment.value = false;
  //     comments.value.unshift(response.data);
  //     postCommentCount.value++;
  //     comment.value = "";
  //   } else {
  //     throw new Error("Failed to Comment...please try again later");
  //   }
  // } catch (error: any) {
  //   if (error.isLimitError) {
  //     // Handle the case where comment limit is reached
  //     confirmDialog();
  //   } else {
  //     // For other errors
  //     console.error(
  //       error.message || "An error occurred while submitting the post."
  //     );
  //   }
  // }
};

const confirmDialog = () => {
  confirm.require({
    message: labels.CONFIRM_HEADER_COMMENT_LIMIT_MESSAGE,
    header: labels.CONFIRM_HEADER_COMMENT_LIMIT_HEADER,
    rejectProps: {
      label: "Close",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: labels.PREMIUM_PLAN,
      icon: "pi pi-crown",
    },
    accept: () => {
      premiumStore.value = true;
    },
    reject: () => {},
  });
};

const deletePost = async () => {
  try {
    const response = await $fetch<{ success: boolean }>(
      `/api/post/${props.post.id!}`,
      {
        method: "DELETE",
      }
    );

    if (response.success) {
      notifications(toast, "success", "Post deleted successfully");
      postStore.triggerRefresh();
    } else {
      throw new Error("Failed to remove post...");
    }
  } catch (error: any) {
    console.error(error);
  }
};

const confirmPostDelete = () => {
  confirm.require({
    message: labels.CONFIRM_REMOVE_POST_TEXT,
    header: labels.CONFIRM_REMOVE_POST_HEADER,
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Yes",
    },
    accept: () => {
      deletePost();
    },
  });
};

const editPostItems = ref([
  {
    label: buttons.EDIT_POST,
    icon: "pi pi-pencil",
    command: () => (isEditPost.value = true),
  },
  {
    separator: true,
  },
  {
    label: buttons.DELETE_POST,
    icon: "pi pi-trash",
    command: () => confirmPostDelete(),
  },
]);

const toggleEditPost = (event: any) => {
  menu.value.toggle(event);
};

const updatePost = async () => {
  isEditPost.value = false;
  postStore.triggerRefresh();
};

function handleCommentDelete(commentId: number) {
  comments.value = comments.value.filter((c) => c.id !== commentId);
  postCommentCount.value--;
}

onMounted(() => {
  postCommentCount.value = props.post.commentCount || 0;
});
</script>

<template>
  <div class="post-item shadow-sm mb-4">
    <!-- Header -->
    <div
      class="d-flex justify-content-between align-items-center mb-3 px-3 pt-3 w-100"
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
              v-if="post.user?.isPremium"
              class="pi pi-crown me-1 premium-badge mb-0"
              title="Premium member"
            ></i>
          </p>

          <small class="postedAgo">Posted {{ postedAgo }}</small>
        </div>
      </div>

      <!-- Right side: Ellipsis Button -->
      <div
        v-if="
          authStore.userId === props.post.user?.id ||
          authStore.userRole === 'admin'
        "
      >
        <Button
          icon="pi pi-ellipsis-v"
          @click="toggleEditPost"
          size="small"
          variant="text"
          aria-haspopup="true"
          aria-controls="overlay_menu"
        />
        <Menu
          ref="menu"
          id="overlay_menu"
          :model="editPostItems"
          :popup="true"
        />
      </div>
    </div>

    <!-- Description -->
    <div class="px-3">
      <p class="post-description">{{ props.post.description }}</p>
    </div>

    <!-- Rank Row -->
    <div class="px-3 pb-2">
      <div
        class="rank-box d-flex flex-column flex-md-row align-items-start align-items-md-center"
      >
        <i class="pi pi-star-fill me-md-2 mb-2 mb-md-0" style="color: silver" />
        <span class="rank-text">{{ props.post.minRank }}</span>
        <span class="mx-1 d-none d-md-inline">to</span>
        <span class="rank-text">{{ props.post.maxRank }}</span>
      </div>
    </div>

    <!-- Positions Row -->
    <div class="px-3 pb-2">
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

    <div
      v-if="postCommentCount"
      class="d-flex justify-content-end px-3 show-comments"
    >
      <Button
        v-if="!showComments"
        :label="`${labels.SHOW_COMMENTS} (${postCommentCount})`"
        size="small"
        variant="text"
        @click="toggleShowComments"
      />

      <Button
        v-else
        :label="labels.HIDE_COMMENTS"
        size="small"
        variant="text"
        @click="toggleShowComments"
      />
    </div>

    <!-- <PostComments
      v-if="showComments && !isLoadingMore"
      :comments="comments"
      :totalCommentsCount="postCommentCount"
      :postId="props.post.id || 0"
      :commentsPerScroll="COMMENTS_PER_SCROLL"
      @on-delete-comment="handleCommentDelete"
    /> -->

    <div class="d-flex justify-content-end gap-2 pb-3 pe-3" v-if="loggedIn">
      <Button
        icon="pi pi-comments"
        :label="labels.COMMENT"
        variant="outlined"
        iconPos="left"
        class="border-0"
        @click="toggleAddComment"
      />
    </div>

    <!-- <div v-if="showAddComment && loggedIn">
      <AddPostComment v-model="comment" />
      <div class="d-flex justify-content-end p-2 gap-1">
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
    </div> -->
  </div>

  <UpdatePost
    @update-post="updatePost"
    :post="props.post"
    v-model:isEditPost="isEditPost"
  />
</template>

<style scoped>
.post-item {
  background-color: var(--bg-post);
  border-radius: 12px;
  transition: box-shadow 0.2s ease;
}

.post-item:hover {
  box-shadow: 0 4px 12px var(--shadow-hover);
}

.username {
  font-weight: 600;
  color: var(--text-primary);
}

.postedAgo {
  font-weight: 300;
  color: var(--text-primary);
}

.show-comments {
  font-weight: 300;
  color: var(--text-primary);
}

.post-description {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.rank-box {
  background-color: var(--bg-rank-box);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rank-text {
  color: var(--rank-text);
  font-weight: bold;
  margin: 0 4px;
}

.position-box {
  background: #0d9488;
  padding: 12px;
  border-radius: 10px;
}

.position-pill {
  background-color: var(--bg-position-pill);
  color: var(--text-pill);
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .send-request .p-button {
    width: 100%;
    max-width: none;
  }

  .rank-box {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
