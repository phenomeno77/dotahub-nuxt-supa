<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useLoadingStore } from "../stores/loading";
import type { Post } from "~/types/Post";
import { useRoute } from "vue-router";
import BannedAlert from "~/components/alerts/BannedAlert.vue";
import SteamLoginFailedAlert from "~/components/alerts/SteamLoginFailedAlert.vue";
import PostSkeleton from "~/components/posts/PostSkeleton.vue";

const loadingStore = useLoadingStore();
const isBanned = ref(false);
const steamLoginFailed = ref(false);
const route = useRoute();
const POSTS_PER_PAGE = 5;
const postStore = usePostStore();

const {
  items: posts,
  total,
  isLoading,
  fetchInitial,
  fetchMore,
} = usePaginatedFetch<Post>("/api/post", POSTS_PER_PAGE);

watch(
  () => postStore.shouldRefreshPosts,
  async (shouldRefresh) => {
    if (shouldRefresh) {
      loadingStore.startLoading();
      fetchInitial();

      postStore.clearRefreshFlag();
      loadingStore.stopLoading();
    }
  }
);

watch(
  () => route.query,
  async () => {
    isBanned.value = route.query.error === "account_banned";
    steamLoginFailed.value = route.query.error === "steam_login_failed";

    if (!isBanned.value && !steamLoginFailed.value) {
      fetchInitial();
    }
  },
  { immediate: false }
);

onMounted(() => {
  loadingStore.startLoading();
  isBanned.value = route.query.error === "account_banned";
  steamLoginFailed.value = route.query.error === "steam_login_failed";

  if (!isBanned.value || !steamLoginFailed.value) {
    fetchInitial();
  }

  loadingStore.stopLoading();

  useInfiniteScroll(document.querySelector("main") as HTMLElement, fetchMore, {
    distance: 10,
    canLoadMore: () => posts.value.length < total.value,
  });
});
</script>

<template>
  <BannedAlert v-if="isBanned" />
  <SteamLoginFailedAlert v-else-if="steamLoginFailed" />

  <div v-if="isLoading">
    <PostSkeleton v-for="n in 3" :key="'skeleton-' + n" />
  </div>

  <Posts v-else :posts="posts" />

  <div v-if="posts.length >= total && !isBanned" class="no-more-posts">
    You've reached the end! 🎉
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
