<script setup lang="ts">
import { computed, onMounted, inject } from "vue";
import { useRoute } from "vue-router";
import { usePostStore } from "~/stores/posts";
import { useLoadingStore } from "~/stores/loading";
import type { Post } from "~/types/Post";
import BannedAlert from "~/components/alerts/BannedAlert.vue";
import SteamLoginFailedAlert from "~/components/alerts/SteamLoginFailedAlert.vue";
import PostItem from "~/components/posts/PostItem.vue";
import PostSkeleton from "~/components/posts/PostSkeleton.vue";

const scrollEl = inject<Ref<HTMLElement | null>>("scrollEl") ?? ref(null);
const route = useRoute();
const postStore = usePostStore();
const loadingStore = useLoadingStore();

const POSTS_PER_PAGE = 5;

const {
  items: posts,
  totalPosts,
  isLoading,
  fetchInitial,
  fetchMore,
} = usePaginatedFetch<Post>("/api/post", POSTS_PER_PAGE);

const isBanned = computed(() => route.query.error === "account_banned");
const steamLoginFailed = computed(
  () => route.query.error === "steam_login_failed"
);
const banReason = computed(() => route.query.banReason || "");
const banExpiration = computed(() => route.query.banExpiration || "");

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

  if (scrollEl.value) {
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

    <div v-if="posts.length >= totalPosts && !isBanned" class="no-more-posts">
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
