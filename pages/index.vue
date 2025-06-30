<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useLoadingStore } from "../stores/loading";
import type { Post } from "~/types/Post";
import { useRoute } from "vue-router";
import BannedAlert from "~/components/alerts/BannedAlert.vue";
import SteamLoginFailedAlert from "~/components/alerts/SteamLoginFailedAlert.vue";
import PostSkeleton from "~/components/posts/PostSkeleton.vue";
import PostItem from "~/components/posts/PostItem.vue";
import { usePostStore } from "~/stores/posts";

const loadingStore = useLoadingStore();
const route = useRoute();
const postStore = usePostStore();

const POSTS_PER_PAGE = 5;

const {
  items: posts,
  total,
  isLoading,
  fetchInitial,
  fetchMore,
} = usePaginatedFetch<Post>("/api/post", POSTS_PER_PAGE);

// Computed for error flags & query info
const isBanned = computed(() => route.query.error === "account_banned");
const steamLoginFailed = computed(
  () => route.query.error === "steam_login_failed"
);
const banReason = computed(() => route.query.banReason || "");
const banExpiration = computed(() => route.query.banExpiration || "");

// Reactively fetch posts when route query changes (error flags)
watch(
  () => route.query,
  async () => {
    if (!isBanned.value && !steamLoginFailed.value) {
      loadingStore.startLoading();
      await fetchMore();
      loadingStore.stopLoading();
    }
  },
  { immediate: true }
);

// Also watch for postStore refresh flag
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
  await fetchInitial();
  // Setup infinite scroll only once on mount
  const scrollEl = document.querySelector("main") as HTMLElement;
  if (scrollEl) {
    useInfiniteScroll(scrollEl, fetchMore, {
      distance: 10,
      canLoadMore: () => posts.value.length < total.value,
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

    <div v-if="posts.length >= total && !isBanned" class="no-more-posts">
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
