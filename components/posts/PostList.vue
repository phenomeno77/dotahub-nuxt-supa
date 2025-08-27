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
    <!-- wrap everything you want blurred in this container -->
    <div :class="['scroll-content', { 'is-blurred': !loggedIn }]">
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
      </div>
    </div>
  </div>

  <!-- Frosted glass login box (moved OUTSIDE the scrollable container so it won't be blurred) -->
  <div v-if="!loadingStore.isLoading && !loggedIn" class="login-box">
    <h5 class="font-bold text-white">Log in to continue</h5>

    <Button class="fancy-login-btn" @click="handleLoginSteam">
      <img :src="steamLogo" alt="Steam Logo" />
      {{ buttons.SIGN_IN }}
    </Button>
  </div>
</template>

<style scoped>
.scroll-content {
  transition: filter 180ms ease, opacity 180ms ease;
  will-change: filter;
}

.scroll-content.is-blurred {
  filter: blur(8px) saturate(130%);
  -webkit-filter: blur(8px) saturate(130%);
  pointer-events: none;
  user-select: none;
  touch-action: none; /* optional: comment out if you want touch interaction preserved */
}

/* Login box styling — keep it sharp and on top */
.login-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50; /* higher than content */
  width: 340px;
  height: 170px;
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  background-color: rgba(var(--bs-dark-rgb), 0.6);
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);

  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 28px rgba(2, 6, 23, 0.6);
}

/* keep the login button above the box visuals */
.login-box .fancy-login-btn {
  z-index: 51;
}

.fancy-login-btn {
  background: linear-gradient(135deg, #0dcaf0, #0d6efd);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
  transition: all 0.2s ease;
  height: 48px;
  width: 100%;
}

.fancy-login-btn:hover {
  background: linear-gradient(135deg, #0d6efd, #0b5ed7);
}
</style>
