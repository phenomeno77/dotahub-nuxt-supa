<script lang="ts" setup>
import { type UserProfile } from "~/types/UserProfile";
import { useToast } from "primevue/usetoast";
import { onMounted, ref, computed, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { usePostStore } from "~/stores/posts";
import { fixed_values } from "~/constants/labels";
import { usePaginatedFetch } from "~/composables/usePaginatedFetch";
import type { Post } from "~/types/Post";

// Components
import BannedAlert from "~/components/alerts/BannedAlert.vue";
import SteamLoginFailedAlert from "~/components/alerts/SteamLoginFailedAlert.vue";
import PostSkeleton from "~/components/posts/PostSkeleton.vue";
import PostItem from "~/components/posts/PostItem.vue";
import UserProfileHeader from "./UserProfileHeader.vue";

const props = defineProps<{ userId: string }>();

const toast = useToast();
const route = useRoute();
const loadingStore = useLoadingStore();
const postStore = usePostStore();

const scrollerContainerRef = ref<HTMLElement | null>(null);
const user = ref<UserProfile>();
const hasLoaded = ref(false);

const {
  items: posts,
  total,
  fetchInitial,
  fetchMore,
  loadingMore,
} = usePaginatedFetch<Post>(
  `/api/post/user/${props.userId}`,
  fixed_values.POSTS_PER_PAGE
);

const isBanned = computed(() => route.query.error === "account_banned");
const steamLoginFailed = computed(
  () => route.query.error === "steam_login_failed"
);
const banReason = computed(() => route.query.banReason || "");
const banExpiration = computed(() => route.query.banExpiration || "");

const fetchUser = async () => {
  try {
    const res = await $fetch<{ success: boolean; user: UserProfile }>(
      `/api/user/${props.userId}`
    );
    if (res.success) {
      user.value = res.user;
    }
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(toast, "warn", "Loading User Failed", message, 3000);
  }
};

// Refresh on external trigger
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
    await fetchUser();
    await fetchInitial();
    hasLoaded.value = true;
    loadingStore.stopLoading();
  }

  await nextTick();

  if (scrollerContainerRef.value) {
    useInfiniteScroll(scrollerContainerRef, fetchMore, {
      distance: 10,
      canLoadMore: () => posts.value.length < total.value,
    });
  }
});
</script>

<template>
  <!-- Alerts -->
  <div class="position-absolute top-0 start-0 end-0 z-3">
    <BannedAlert
      v-if="isBanned"
      :ban-reason="banReason"
      :ban-expiration="banExpiration"
    />
    <SteamLoginFailedAlert v-else-if="steamLoginFailed" />
  </div>

  <!-- Scrollable content: header + posts -->
  <div
    ref="scrollerContainerRef"
    class="position-absolute start-0 end-0 overflow-auto"
    style="top: 80px; bottom: 40px"
  >
    <div class="container-fluid py-4">
      <!-- Post Feed -->
      <div class="row justify-content-center">
        <div class="col-md-6 col-11 p-0">
          <!-- User Header -->
          <UserProfileHeader v-if="user && posts.length > 0" :user="user" />

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

          <div
            v-if="hasLoaded && posts.length === 0 && !loadingStore.isLoading"
            class="no-more-posts text-center mt-4"
          >
            <p>Nothing to see here… yet! 👀</p>
            <p>Time to add some awesome content! ✨</p>
          </div>

          <!-- Skeletons -->
          <div v-if="loadingStore.isLoading || loadingMore">
            <div
              class="mb-3"
              v-for="n in fixed_values.POSTS_PER_PAGE"
              :key="'skeleton-' + n"
            >
              <PostSkeleton />
            </div>
          </div>

          <!-- End of list -->
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
.user-header {
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>
