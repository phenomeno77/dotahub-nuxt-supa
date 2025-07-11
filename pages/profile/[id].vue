<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useLoadingStore } from "~/stores/loading";
import type { Post } from "~/types/Post";
import { useRoute } from "vue-router";
import BannedAlert from "~/components/alerts/BannedAlert.vue";
import SteamLoginFailedAlert from "~/components/alerts/SteamLoginFailedAlert.vue";
import PostSkeleton from "~/components/posts/PostSkeleton.vue";
import PostItem from "~/components/posts/PostItem.vue";
import { usePostStore } from "~/stores/posts";

definePageMeta({
  middleware: "auth-logged-in-user",
});

const loadingStore = useLoadingStore();
const route = useRoute();
const postStore = usePostStore();
const scrollEl = inject<Ref<HTMLElement | null>>("scrollEl");
const POSTS_PER_PAGE = 20;
const userId = route.params.id as string;

const {
  items: posts,
  total,
  isLoading,
  fetchInitial,
  fetchMore,
} = usePaginatedFetch<Post>(`/api/post/${userId}`, POSTS_PER_PAGE);

// Computed for error flags & query info
const isBanned = computed(() => route.query.error === "account_banned");
const steamLoginFailed = computed(
  () => route.query.error === "steam_login_failed"
);
const banReason = computed(() => route.query.banReason || "");
const banExpiration = computed(() => route.query.banExpiration || "");

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
  if (!isBanned.value && !steamLoginFailed.value) {
    loadingStore.startLoading();
    await fetchInitial();
    loadingStore.stopLoading();
  }

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

    <div v-if="!posts.length" class="no-more-posts">
      Looks like it's quiet here. No posts so far...
    </div>

    <div
      v-if="posts.length && posts.length >= total && !isBanned"
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
