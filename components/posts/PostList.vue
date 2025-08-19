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

  if (scrollerContainerRef.value && loggedIn.value) {
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
    class="position-absolute start-0 end-0 overflow-auto"
    style="top: 80px; bottom: 40px"
  >
    <div class="container-fluid py-4 position-relative">
      <div class="row justify-content-center">
        <!-- Center Column only -->
        <div class="col-md-6 col-11 p-0">
          <!-- Alerts on top -->
          <BannedAlert
            v-if="isBanned"
            :ban-reason="banReason"
            :ban-expiration="banExpiration"
          />
          <SteamLoginFailedAlert v-else-if="steamLoginFailed" />

          <div
            v-if="loadNewestPosts"
            class="mb-3 d-flex w-100 justify-content-center"
          >
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
                class="d-flex flex-column gap-5"
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

          <!-- Inline Skeletons directly below posts -->
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
            class="no-more-posts text-center mt-4"
          >
            You've reached the end! 🎉
          </div>

          <div
            v-else-if="
              filterSearchStore.searchQuery && posts.length === 0 && !isBanned
            "
            class="no-posts-found text-center mt-4"
          >
            No posts found for this user.
          </div>
        </div>
      </div>

      <!-- Blur overlay covering just the posts area -->
      <div
        v-if="!loggedIn"
        class="position-absolute top-0 start-0 w-100 h-100"
        style="backdrop-filter: blur(4px); z-index: 10"
      ></div>

      <!-- Fancy frosted glass login box -->
      <div
        v-if="!loadingStore.isLoading && !loggedIn"
        class="position-fixed top-50 start-50 translate-middle text-center rounded-4 shadow-lg p-4 d-flex flex-column justify-content-center align-items-center gap-2"
        style="
          background-color: rgba(var(--bs-dark-rgb), 0.6);
          backdrop-filter: blur(12px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          z-index: 20;
          width: 340px;
          height: 170px;
        "
      >
        <div>
          <h5 class="fw-bold text-white">Log in to continue</h5>
        </div>

        <Button class="fancy-login-btn" @click="handleLoginSteam">
          <img :src="steamLogo" alt="Steam Logo" />
          {{ buttons.SIGN_IN }}
        </Button>
      </div>
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
