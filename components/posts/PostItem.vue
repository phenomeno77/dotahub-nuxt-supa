<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "~/stores/auth";
import type { Post } from "~/types/Post";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { buttons, labels } from "~/constants/labels";
import type { Comment } from "~/types/Post";
import { usePostStore } from "~/stores/posts";
import notifications from "~/utils/notifications";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import UpdatePost from "./UpdatePost.vue";
import PostCommentDialog from "../post-comments/PostCommentDialog.vue";

dayjs.extend(relativeTime);

const props = defineProps<{ post: Post }>();

const { loggedIn } = useUserSession();
const authStore = useAuthStore();
const avatarImage = computed(() => props.post.user?.avatarUrl || undefined);
const showPostCommentDialog = ref(false);
const comments = ref<Comment[]>([]);
const expandedPosts = ref<number[]>([]);
const menu = ref();
const postStore = usePostStore();
const toast = useToast();
const confirm = useConfirm();
const isEditPost = ref(false);

const postCommentCount = ref<number>(0);

const positionLabels: Record<string, string> = {
  carry: "Carry",
  mid: "Mid",
  offlane: "Offlane",
  soft_support: "Soft Support",
  hard_support: "Hard Support",
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

const toggleShowPostCommentsDialog = async () => {
  showPostCommentDialog.value = !showPostCommentDialog.value;
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
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(toast, "warn", "Delete Post Failed", message, 3000);
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
  <div class="post-item mb-4">
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
            isPostExpanded(props.post.id as number) ? "Show Less" : "Show More"
          }}
        </Button>
      </div>
    </div>

    <!-- Rank Row -->
    <div class="px-3 pb-2">
      <div
        class="rank-box d-flex align-items-start align-items-center p-2 gap-1"
      >
        <i class="pi pi-star-fill" style="color: silver" />
        <span class="rank-text">{{ props.post.minRank }}</span>
        <span class="mx-1">to</span>
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
      v-if="postCommentCount && loggedIn"
      class="position-relative px-3 py-2 show-comments"
    >
      <Button
        class="position-absolute end-0 top-50 translate-middle-y me-3"
        v-if="!showPostCommentDialog"
        :label="`${labels.SHOW_COMMENTS} (${postCommentCount})`"
        size="small"
        variant="text"
        @click="toggleShowPostCommentsDialog"
      />

      <Button
        icon="pi pi-comments"
        :label="labels.COMMENT"
        variant="outlined"
        iconPos="left"
        class="d-block mx-auto border-0"
        @click="toggleShowPostCommentsDialog"
      />
    </div>

    <PostCommentDialog
      v-if="showPostCommentDialog"
      v-model:showPostCommentDialog="showPostCommentDialog"
      :post="props.post"
    />
  </div>

  <UpdatePost
    @update-post="updatePost"
    :post="props.post"
    v-model:isEditPost="isEditPost"
  />
</template>

<style scoped></style>
