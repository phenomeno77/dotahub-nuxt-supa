<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { usePostStore } from "~/stores/posts";
import type { Post } from "~/types/Post";
import BannedAlert from "~/components/alerts/BannedAlert.vue";
import SteamLoginFailedAlert from "~/components/alerts/SteamLoginFailedAlert.vue";
import PostItem from "~/components/posts/PostItem.vue";
import PostSkeleton from "~/components/posts/PostSkeleton.vue";
import { useRealtimePosts } from "~/composables/useRealtimePosts";
import { buttons, fixed_values } from "~/constants/labels";
import { useGlobalFilterSearch } from "~/stores/globalFilterSearch";
import steamLogo from "~/assets/steam.svg";

const route = useRoute();
const postStore = usePostStore();
const loadingStore = useLoadingStore();
const scrollerContainerRef = ref<HTMLElement | null>(null);
const loadNewestPosts = ref(false);
const filterSearchStore = useGlobalFilterSearch();
const { user: currentUser, loggedIn } = useUserSession();

const {
  items: posts,
  total,
  fetchInitial,
  fetchMore,
  loadingMore,
} = usePaginatedFetch<Post>("/api/post", fixed_values.POSTS_PER_PAGE, () => {
  const params: Record<string, any> = {
    searchQuery: filterSearchStore.searchQuery,
  };

  if (filterSearchStore.rankFilter) {
    params.rank = filterSearchStore.rankFilter;
  }

  if (filterSearchStore.positionFilter.length) {
    params.positions = filterSearchStore.positionFilter;
  }

  return params;
});

const isBanned = computed(() => route.query.error === "account_banned");
const steamLoginFailed = computed(
  () => route.query.error === "steam_login_failed"
);
const banReason = computed(() => route.query.banReason || "");
const banExpiration = computed(() => route.query.banExpiration || "");

const handleLoginSteam = () => {
  window.location.href = "/api/auth/steam";
};

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

watch(
  () => [
    filterSearchStore.searchQuery,
    filterSearchStore.rankFilter,
    filterSearchStore.positionFilter,
  ],
  () => {
    fetchInitial();
  }
);

const reloadNewPosts = async () => {
  loadingStore.startLoading();
  await fetchInitial();
  loadingStore.stopLoading();
  loadNewestPosts.value = false;
};

let unsubscribePosts: () => Promise<void>;

onMounted(async () => {
  if (!isBanned.value && !steamLoginFailed.value) {
    await fetchInitial();
  }

  if (currentUser.value) {
    unsubscribePosts = useRealtimePosts(currentUser.value.id, () => {
      loadNewestPosts.value = true;
    });
  }

  if (scrollerContainerRef.value) {
    useInfiniteScroll(scrollerContainerRef, fetchMore, {
      distance: 10,
      canLoadMore: () => posts.value.length < total.value,
    });
  }
});

onBeforeUnmount(async () => {
  if (unsubscribePosts) {
    await unsubscribePosts();
  }
});
</script>

<template>
  <!-- Scrollable area -->
  <div
    ref="scrollerContainerRef"
    class="absolute left-0 right-0 overflow-auto"
    style="top: 80px; bottom: 40px"
  >
    <div class="container mx-auto py-4 flex justify-center">
      <!-- Center Column -->
      <div class="w-full md:w-1/2 p-0 px-4">
        <!-- Alerts -->
        <BannedAlert
          v-if="isBanned"
          :ban-reason="banReason"
          :ban-expiration="banExpiration"
        />
        <SteamLoginFailedAlert v-else-if="steamLoginFailed" />

        <!-- Load New Posts Button -->
        <div v-if="loadNewestPosts" class="mb-3 flex w-full justify-center">
          <Button
            @click="reloadNewPosts"
            severity="info"
            icon="pi pi-refresh"
            variant="text"
            :label="buttons.LOAD_NEW_POSTS"
          />
        </div>

        <!-- Virtual Scroller -->
        <DynamicScroller :items="posts" :min-item-size="430" page-mode>
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              class="flex flex-col gap-5"
              :item="item"
              :active="active"
              :size-dependencies="[item.description]"
              :data-index="index"
              :data-active="active"
              :key="item.id"
            >
              <PostItem :post="item" />
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>

        <!-- Skeleton loaders -->
        <div v-if="loadingStore.isLoading || loadingMore">
          <div
            class="mb-3"
            v-for="n in fixed_values.POSTS_PER_PAGE"
            :key="'skeleton-' + n"
          >
            <PostSkeleton />
          </div>
        </div>

        <!-- End-of-list message -->
        <div
          v-if="posts.length > 0 && posts.length >= total && !isBanned"
          class="text-center mt-4 text-gray-500 italic text-sm opacity-80"
        >
          You've reached the end! 🎉
        </div>

        <div
          v-else-if="
            filterSearchStore.searchQuery && posts.length === 0 && !isBanned
          "
          class="text-center mt-4"
        >
          No posts found for this user.
        </div>
      </div>

      <!-- Blur overlay -->
      <div
        v-if="!loggedIn"
        class="absolute top-0 left-0 w-full h-full"
        style="backdrop-filter: blur(4px); z-index: 10"
      ></div>

      <!-- Frosted glass login box -->
      <div
        v-if="!loadingStore.isLoading && !loggedIn"
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center rounded-2xl shadow-lg p-4 flex flex-col justify-center items-center gap-2"
        style="
          background-color: rgba(var(--bs-dark-rgb), 0.6);
          backdrop-filter: blur(12px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          z-index: 20;
          width: 340px;
          height: 170px;
        "
      >
        <h5 class="font-bold text-white">Log in to continue</h5>

        <Button class="fancy-login-btn" @click="handleLoginSteam">
          <img :src="steamLogo" alt="Steam Logo" />
          {{ buttons.SIGN_IN }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fancy-login-btn {
  background: linear-gradient(135deg, #0dcaf0, #0d6efd);
  border: none;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
  transition: all 0.2s ease;
  color: #fff;
  height: 48px;
  width: 100%;
}

.fancy-login-btn:hover {
  background: linear-gradient(135deg, #0d6efd, #0b5ed7);
}
</style>
