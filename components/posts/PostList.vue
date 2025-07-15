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
  total,
  isLoading,
  fetchInitial,
  fetchMore,
} = usePaginatedFetch<Post>("/api/post", POSTS_PER_PAGE);


const { list, containerProps, wrapperProps } = useVirtualList(posts, {
  itemHeight: 300, // Estimate average post height
})

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

 <main   class="position-absolute start-0 end-0"
    style="top: 100px; bottom: 3%; ">
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <!-- Left Sidebar (hidden on mobile) -->
        <div class="col-md-3 d-none d-md-block">
          <!-- Left Sidebar content -->
        </div>

        <!-- Center Column -->
        <div class="col-md-6 col-12 p-0">
          <div v-bind="containerProps">
            <div v-bind="wrapperProps">
              <div
                v-for="{ index, data: post } in list"
                :key="post.id"
              >
                <PostItem :post="post" />
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar (hidden on mobile) -->
        <div class="col-md-3 d-none d-md-block">
          <!-- Right Sidebar content -->
        </div>
      </div>
    </div>
  </main>

  <PostSkeleton
    v-if="isLoading"
    v-for="n in POSTS_PER_PAGE"
    :key="'skeleton-' + n"
    class="mb-3"
  />

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

html,
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

main {
  height: 100%;
}
</style>
