<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useLoadingStore } from "../stores/loading";
import type { Post } from "~/types/Post";
import notifications from "~/utils/notifications";
import { useToast } from "primevue/usetoast";
import { useRoute } from "vue-router";
import BannedAlert from "~/components/alerts/BannedAlert.vue";
import SteamLoginFailedAlert from "~/components/alerts/SteamLoginFailedAlert.vue";
import PostSkeleton from "~/components/posts/PostSkeleton.vue";

const toast = useToast();
const loadingStore = useLoadingStore();
const isBanned = ref(false);
const steamLoginFailed = ref(false);
const route = useRoute();
const posts = ref<Post[]>([]);
const isLoadingMore = ref(false);
const POSTS_PER_PAGE = 5;
const maxPosts = ref(0);
const postStore = usePostStore();
let scrollElement: HTMLElement;

const fetchPosts = async () => {
  try {
    isLoadingMore.value = true;
    const response = await $fetch(`/api/post?limit=${POSTS_PER_PAGE}&skip=0`);

    if (response.success) {
      posts.value = response.posts.map((post) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      }));
      maxPosts.value = response.total;
    }
  } catch (error: any) {
    notifications(toast, "warn", "Fetching Posts Failed", error.message, 3000);
  } finally {
    isLoadingMore.value = false;
  }
};

// const getPostsOnScroll = async () => {
//   try {
//     isLoadingMore.value = true;
//     const response = await api.post.getPostsByPage(POSTS_PER_PAGE, posts.value.length);

//     if (response.status === 'ok') {
//       const newPosts = response.data.posts;

//       posts.value.push(...newPosts);
//     }
//   } catch (error: any) {
//     notifications(toast, 'warn', 'Fetching Posts Failed', error.message, 3000);
//   } finally {
//     isLoadingMore.value = false;
//   }
// };

// scrollElement = document.querySelector('main') as HTMLElement;

// useInfiniteScroll(
//   scrollElement,
//   async () => {
//     await getPostsOnScroll();
//   },
//   {
//     distance: 10,
//     canLoadMore: () => {
//       return posts.value.length < maxPosts.value;
//     },
//   },
// );

watch(
  () => postStore.shouldRefreshPosts,
  async (shouldRefresh) => {
    if (shouldRefresh) {
      loadingStore.startLoading();
      await fetchPosts();
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
      await fetchPosts();
    }
  },
  { immediate: false }
);

onMounted(async () => {
  loadingStore.startLoading();
  isBanned.value = route.query.error === "account_banned";
  steamLoginFailed.value = route.query.error === "steam_login_failed";

  if (!isBanned.value || !steamLoginFailed.value) {
    await fetchPosts();
  }
  loadingStore.stopLoading();
});
</script>

<template>
  <BannedAlert v-if="isBanned" />
  <SteamLoginFailedAlert v-else-if="steamLoginFailed" />

  <div v-else>
    <Posts v-if="!loadingStore.isLoading" :posts="posts" />

    <div v-if="loadingStore.isLoading">
      <PostSkeleton v-for="n in 3" :key="'skeleton-' + n" />
    </div>
  </div>

  <div v-if="posts.length >= maxPosts && !isBanned" class="no-more-posts">
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
