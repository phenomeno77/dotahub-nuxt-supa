<!-- components/user/UserPostFeed.vue -->
<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useLoadingStore } from "~/stores/loading";
import { usePostStore } from "~/stores/posts";
import type { Post } from "~/types/Post";
import BannedAlert from "~/components/alerts/BannedAlert.vue";
import SteamLoginFailedAlert from "~/components/alerts/SteamLoginFailedAlert.vue";
import PostSkeleton from "~/components/posts/PostSkeleton.vue";
import PostItem from "~/components/posts/PostItem.vue";

const props = defineProps<{
  userId: string;
}>();

const loadingStore = useLoadingStore();
const postStore = usePostStore();
const scrollEl = inject<Ref<HTMLElement | null>>("scrollEl") ?? ref(null);
const POSTS_PER_PAGE = 5;

const {
  items: posts,
  totalPosts,
  isLoading,
  fetchInitial,
  fetchMore,
} = usePaginatedFetch<Post>(`/api/post/${props.userId}`, POSTS_PER_PAGE);

// Computed for error flags & query info
const route = useRoute();
const isBanned = computed(() => route.query.error === "account_banned");
const steamLoginFailed = computed(
  () => route.query.error === "steam_login_failed"
);
const banReason = computed(() => route.query.banReason || "");
const banExpiration = computed(() => route.query.banExpiration || "");

// Refresh on flag change
watch(
  () => postStore.shouldRefreshPosts,
  async (shouldRefresh) => {
    if (shouldRefresh) {
      loadingStore.startLoading();
      await fetchInitial();
      postStore.clearRefreshFlag();
      loadingStore.stopLoading();
    }
  }
);

onMounted(async () => {
  if (!isBanned.value && !steamLoginFailed.value) {
    loadingStore.startLoading();
    await fetchInitial();
    loadingStore.stopLoading();
  }

  if (scrollEl) {
    useInfiniteScroll(scrollEl, fetchMore, {
      distance: 10,
      canLoadMore: () => posts.value.length < totalPosts.value,
    });
  }
});
</script>

<template>
  <BannedAlert
    v-if="isBanned"
    :ban-reason="banReason"
    :ban-expiration="banExpiration"
  />
  <SteamLoginFailedAlert v-else-if="steamLoginFailed" />

  <div v-if="isLoading">
    <PostSkeleton v-for="n in 3" :key="'skeleton-' + n" />
  </div>

  <div v-else>
    <div v-for="post in posts" :key="post.id" style="padding: 1rem 0">
      <PostItem :post="post" />
    </div>

    <div v-if="!posts.length" class="no-more-posts">
      Looks like it's quiet here. No posts so far...
    </div>

    <div
      v-if="posts.length && posts.length >= totalPosts && !isBanned"
      class="no-more-posts"
    >
      You've reached the end! 🎉
    </div>
  </div>
</template>

<style scoped>
.no-more-posts {
  text-align: center;
  color: #888;
  margin: 2rem 0;
  font-style: italic;
  font-size: 0.95rem;
  opacity: 0.8;
}
</style>
