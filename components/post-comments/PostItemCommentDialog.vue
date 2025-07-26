<script lang="ts" setup>
import type { Post } from "~/types/Post";
import dayjs from "dayjs";
import { labels } from "~/constants/labels";

const props = defineProps<{ post: Post }>();
const { loggedIn } = useUserSession();
const expandedPosts = ref<number[]>([]);
const avatarImage = computed(() => props.post.user?.avatarUrl || undefined);
const avatarLabel = computed(() =>
  !props.post.user?.avatarUrl && props.post.user?.username
    ? props.post.user.username.charAt(0).toUpperCase()
    : undefined
);
const positionLabels: Record<string, string> = {
  carry: "Carry",
  mid: "Mid",
  offlane: "Offlane",
  soft_support: "Soft Support",
  hard_support: "Hard Support",
};

const postedAgo = computed(() => {
  return dayjs(props.post.createdAt).fromNow(); // e.g. "2 hours ago"
});

const getPositionIcon = (position: string) => {
  switch (position.toLowerCase()) {
    case "carry":
      return "pi pi-bolt";
    case "mid":
      return "pi pi-bullseye";
    case "offlane":
      return "pi pi-shield";
    case "soft_support":
      return "pi pi-users";
    case "hard_support":
      return "pi pi-heart";
    default:
      return "pi pi-user";
  }
};

function isPostExpanded(id: number) {
  return expandedPosts.value.includes(id);
}

function togglePostExpand(id: number) {
  if (isPostExpanded(id)) {
    expandedPosts.value = expandedPosts.value.filter((i) => i !== id);
  } else {
    expandedPosts.value.push(id);
  }
}
</script>

<template>
  <Card
    style="
      width: 100%;
      overflow: hidden;
      background-color: var(--bg-post);
      margin-bottom: 50px;
      flex-shrink: 0;
    "
    :pt="{
      body: {
        style: { padding: '10px' },
      },
      title: {
        style: { fontWeight: '600', fontSize: '18px' },
      },
    }"
  >
    <template #header v-if="false">
      <img
        alt="user header"
        src="https://primefaces.org/cdn/primevue/images/usercard.png"
      />
    </template>
    <template #title
      ><div
        class="d-flex justify-content-between align-items-center mb-3 w-100"
      >
        <div class="d-flex align-items-center overflow-hidden">
          <Avatar
            :image="avatarImage"
            :label="avatarLabel"
            class="me-2 flex-shrink-0"
            size="large"
            shape="circle"
          />
          <div
            style="max-width: 400px"
            class="d-flex flex-column overflow-hidden"
          >
            <p
              class="mb-0 fw-bold d-flex align-items-center"
              :title="props.post.user?.username"
            >
              <template v-if="loggedIn">
                <a
                  :href="`/profile/${props.post.user?.id}`"
                  class="text-truncate username"
                  style="
                    max-width: 400px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  {{ props.post.user?.username }}
                </a>
              </template>

              <template v-else>
                <span
                  class="text-truncate"
                  style="
                    max-width: 400px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  {{ props.post.user?.username }}
                </span>
              </template>
            </p>

            <small class="postedAgo">Posted {{ postedAgo }}</small>
          </div>
        </div>
      </div></template
    >

    <template #content>
      <!-- Description -->
      <div class="post-description-wrapper pb-2">
        <p class="post-description">
          {{ props.post.description }}
        </p>
      </div>

      <!-- Rank Row -->
      <div class="pb-2">
        <div
          class="rank-box d-flex align-items-start align-items-center p-2 gap-1"
        >
          <i class="pi pi-star-fill" style="color: silver" />
          <span class="rank-text">{{ props.post.minRank }}</span>
          <span class="mx-1">to</span>
          <span class="rank-text">{{ props.post.maxRank }}</span>
        </div>
      </div>

      <!-- Positions Row -->
      <div class="pb-2">
        <div class="position-box">
          <p class="mb-2 fw-bold text-white">{{ labels.LOOKING_FOR }}</p>
          <div class="d-flex flex-wrap gap-2">
            <div
              v-for="position in props.post.positionsNeeded"
              :key="position"
              class="position-pill"
            >
              <i :class="getPositionIcon(position)" class="me-1" />
              {{ positionLabels[position] }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style></style>
