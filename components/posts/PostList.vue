<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { usePostStore } from "~/stores/posts";
import { useLoadingStore } from "~/stores/loading";
import type { Post } from "~/types/Post";
import BannedAlert from "~/components/alerts/BannedAlert.vue";
import SteamLoginFailedAlert from "~/components/alerts/SteamLoginFailedAlert.vue";
import PostItem from "~/components/posts/PostItem.vue";
import PostSkeleton from "~/components/posts/PostSkeleton.vue";
import { useRealtimePosts } from "~/composables/useRealtimePosts";
import { buttons, fixed_values } from "~/constants/labels";

const route = useRoute();
const postStore = usePostStore();
const loadingStore = useLoadingStore();
const scrollerContainerRef = ref<HTMLElement | null>(null);
const loadNewestPosts = ref(false);
const { user: currentUser } = useUserSession();

const {
  items: posts,
  total,
  isLoadingInit,
  isLoadingMore,
  fetchInitial,
  fetchMore,
} = usePaginatedFetch<Post>("/api/post", fixed_values.POSTS_PER_PAGE);

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

const reloadNewPosts = async () => {
  loadingStore.startLoading();
  await fetchInitial();
  loadingStore.stopLoading();
  loadNewestPosts.value = false;
};

let unsubscribePosts: () => Promise<void>;

onMounted(async () => {
  if (!isBanned.value && !steamLoginFailed.value) {
    loadingStore.startLoading();
    await fetchInitial();
    loadingStore.stopLoading();
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
    class="position-absolute start-0 end-0 overflow-auto"
    style="top: 80px; bottom: 40px"
  >
    <div class="container-fluid py-4">
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
                <div>
                  <PostItem :post="item" />
                </div>
              </DynamicScrollerItem>
            </template>
          </DynamicScroller>

          <!-- Inline Skeletons directly below posts -->
          <div v-if="isLoadingInit || isLoadingMore">
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
