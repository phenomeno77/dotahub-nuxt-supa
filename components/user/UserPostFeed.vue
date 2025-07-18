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
const POSTS_PER_PAGE = 20;
const scrollerContainerRef = ref<HTMLElement | null>(null);

const {
  items: posts,
  total,
  isLoadingInit,
  isLoadingMore,
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

  if (scrollerContainerRef.value) {
    useInfiniteScroll(scrollerContainerRef, fetchMore, {
      distance: 10,
      canLoadMore: () => posts.value.length < total.value,
    });
  }
});
</script>

<template>
  <!-- Alerts on top -->
  <div class="position-absolute top-0 start-0 end-0 z-3">
    <BannedAlert
      v-if="isBanned"
      :ban-reason="banReason"
      :ban-expiration="banExpiration"
    />
    <SteamLoginFailedAlert v-else-if="steamLoginFailed" />
  </div>

  <!-- Scrollable area -->
  <div
    ref="scrollerContainerRef"
    class="position-absolute start-0 end-0 overflow-auto"
    style="top: 80px; bottom: 40px"
  >
    <div class="container-fluid py-4">
      <div class="row justify-content-center">
        <!-- Center Column only -->
        <div class="col-md-6 col-11 p-0">
          <!-- Virtual Scroller -->
          <DynamicScroller :items="posts" :min-item-size="300" page-mode>
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
                <div class="d-flex flex-column gap-5">
                  <PostItem :post="item" />
                </div>
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>

          <!-- Inline Skeletons directly below posts -->
          <div v-if="isLoadingInit || isLoadingMore">
            <div
              class="mb-3"
              v-for="n in POSTS_PER_PAGE"
              :key="'skeleton-' + n"
            >
              <PostSkeleton />
            </div>
          </div>

          <!-- End-of-list message -->
          <div
            v-if="posts.length >= total && !isBanned"
            class="no-more-posts text-center mt-4"
          >
            You've reached the end! 🎉
          </div>
        </div>
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
</style>
