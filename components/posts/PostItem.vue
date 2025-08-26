<script lang="ts" setup>
import { computed, ref } from "vue";
import type { Post } from "~/types/Post";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { buttons, fixed_values, labels } from "~/constants/labels";
import { usePostStore } from "~/stores/posts";
import notifications from "~/utils/notifications";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import UpdatePost from "./UpdatePost.vue";
import PostCommentDialog from "../post-comments/PostCommentDialog.vue";
import { autoLinkText } from "~/composables/useAutoLink";

dayjs.extend(relativeTime);

const props = defineProps<{ post: Post }>();
const emits = defineEmits(["comment-added"]);

const { loggedIn, user: currentUser } = useUserSession();
const toast = useToast();
const confirm = useConfirm();
const postStore = usePostStore();

const avatarImage = computed(
  () => localPost.value.user?.avatarUrl || undefined
);
const avatarLabel = computed(() =>
  !localPost.value.user?.avatarUrl && localPost.value.user?.username
    ? localPost.value.user.username.charAt(0).toUpperCase()
    : undefined
);

const postedAgo = computed(() => dayjs(localPost.value.createdAt).fromNow());
const loadingStore = useLoadingStore();
const showPostCommentDialog = ref(false);
const expandedPosts = ref<number[]>([]);
const menu = ref();
const isEditPost = ref(false);
const postCommentCount = ref<number>(props.post.commentCount ?? 0);
const localPost = ref<Post>({ ...props.post });

const positionLabels: Record<string, string> = {
  carry: "Carry",
  mid: "Mid",
  offlane: "Offlane",
  soft_support: "Soft Support",
  hard_support: "Hard Support",
};

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

const toggleShowPostCommentsDialog = () => {
  showPostCommentDialog.value = !showPostCommentDialog.value;
};

const deletePost = async () => {
  try {
    const response = await $fetch<{ success: boolean }>(
      `/api/post/${localPost.value.id!}`,
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

const updatePost = (updated: Post) => {
  loadingStore.startLoading();
  isEditPost.value = false;
  localPost.value = { ...localPost.value, ...updated };
  loadingStore.stopLoading();
};

function commentDeleted() {
  postCommentCount.value--;
}

function incrementCommentCount() {
  postCommentCount.value++;
}

function updateCommentCount(newCount: number) {
  postCommentCount.value = newCount;
}

const safeDescription = computed(() => {
  const desc = localPost.value.description ?? "";
  const maxLength = fixed_values.MAX_POST_PREVIEW_LENGTH;

  let truncated = desc;
  if (
    !isPostExpanded(localPost.value.id as number) &&
    desc.length > maxLength
  ) {
    const lastSpaceIndex = desc.lastIndexOf(" ", maxLength);
    truncated =
      desc.slice(0, lastSpaceIndex > 0 ? lastSpaceIndex : maxLength) + "...";
  }

  return autoLinkText(truncated);
});
</script>

<template>
  <Card
    style="
      width: 100%;
      overflow: hidden;
      background-color: var(--bg-post);
      margin-bottom: 50px;
    "
    :pt="{
      body: {
        style: { padding: '10px' },
      },
      title: {
        style: { fontWeight: '600', fontSize: '18px' },
      },
    }"
  >
    <!-- Title / Header -->
    <template #title>
      <div class="flex justify-between items-center mb-3 w-full">
        <div class="flex items-center overflow-hidden">
          <Avatar
            :image="avatarImage"
            :label="avatarLabel"
            class="mr-2 flex-shrink-0"
            size="large"
            shape="circle"
          />
          <div class="flex flex-col overflow-hidden max-w-[400px]">
            <p
              class="mb-0 font-bold flex items-center"
              :title="localPost.user?.username"
            >
              <template v-if="loggedIn">
                <a
                  :href="`/profile/${localPost.user?.publicId}`"
                  class="truncate max-w-[400px] username"
                >
                  {{ localPost.user?.username }}
                </a>
              </template>
              <template v-else>
                <span class="truncate max-w-[400px] username">{{
                  localPost.user?.username
                }}</span>
              </template>
            </p>
            <small class="postedAgo">Posted {{ postedAgo }}</small>
          </div>
        </div>

        <!-- Menu -->
        <div
          v-if="
            loggedIn &&
            (currentUser.publicId === localPost.user?.publicId ||
              currentUser.role === 'admin')
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
    </template>

    <!-- Content -->
    <template #content>
      <!-- Description -->
      <div class="pb-2">
        <div
          :class="['post-description-wrapper', { 'expandable-description': isPostExpanded(localPost.id as number) }]"
        >
          <div v-html="safeDescription" class="post-description" />
        </div>
        <div class="flex justify-end">
          <Button
            v-if="
              (localPost.description?.length ?? 0) > 300 &&
              localPost.id !== undefined
            "
            variant="link"
            @click="togglePostExpand(localPost.id as number)"
          >
            {{
              isPostExpanded(localPost.id as number) ? "Show Less" : "Show More"
            }}
          </Button>
        </div>
      </div>

      <!-- Rank Row -->
      <div class="pb-2">
        <div class="rank-box flex items-center p-2 gap-1">
          <i class="pi pi-star-fill text-silver" />
          <span class="rank-text">{{ localPost.minRank }}</span>
          <span class="mx-1">to</span>
          <span class="rank-text">{{ localPost.maxRank }}</span>
        </div>
      </div>

      <!-- Positions Row -->
      <div class="pb-2">
        <div class="position-box">
          <p class="mb-2 font-bold text-white">{{ labels.LOOKING_FOR }}</p>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="position in localPost.positionsNeeded"
              :key="position"
              class="position-pill"
            >
              <i :class="getPositionIcon(position)" />
              {{ positionLabels[position] }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Footer / Comments -->
    <template #footer>
      <div
        class="flex flex-col md:flex-row items-center justify-evenly gap-2 show-comments"
      >
        <!-- Show Comments Button -->
        <div
          v-if="postCommentCount > 0"
          class="flex justify-center md:justify-end order-1 md:order-3 w-full md:w-auto"
        >
          <Button
            :label="`${labels.SHOW_COMMENTS} (${postCommentCount})`"
            size="small"
            variant="text"
            class="w-full md:w-auto"
            @click="toggleShowPostCommentsDialog"
          />
        </div>

        <!-- Comment Button -->
        <div class="flex justify-center order-2 w-full md:w-auto">
          <Button
            icon="pi pi-comments"
            :label="labels.COMMENT"
            size="small"
            variant="text"
            iconPos="left"
            class="border-0 w-full md:w-auto"
            @click="toggleShowPostCommentsDialog"
          />
        </div>

        <!-- Post Comment Dialog -->
        <PostCommentDialog
          v-if="showPostCommentDialog"
          v-model:showPostCommentDialog="showPostCommentDialog"
          @comment-deleted="commentDeleted"
          @increment-comment-count="incrementCommentCount"
          @update-comment-count="updateCommentCount"
          :post="localPost"
        />
      </div>
    </template>
  </Card>

  <UpdatePost
    @update-post="updatePost"
    :post="localPost"
    v-model:isEditPost="isEditPost"
  />
</template>

<style scoped>
/* Optional: add scoped styles if needed */
</style>
