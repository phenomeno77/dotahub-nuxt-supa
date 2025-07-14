<script lang="ts" setup>
import type { Post } from "~/types/Post";
import dayjs from "dayjs";
import { labels } from "~/constants/labels";

const props = defineProps<{ post: Post }>();

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
  <div class="post-item mb-4 px-3 pt-3">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3 w-100">
      <div class="d-flex align-items-center">
        <Avatar
          :image="avatarImage"
          :label="avatarLabel"
          class="me-2"
          size="xlarge"
          shape="circle"
        />
        <div>
          <p class="mb-0 fw-bold username">
            {{ props.post.user?.username }}
            <i
              v-if="props.post.user?.isPremium"
              class="pi pi-crown me-1 premium-badge mb-0"
              title="Premium member"
            ></i>
          </p>

          <small class="postedAgo">Posted {{ postedAgo }}</small>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div>
      <div
        :class="[
              'post-description-wrapper',
              { 'expandable-description': isPostExpanded(props.post.id as number) }
            ]"
      >
        <p class="post-description">
          {{
            isPostExpanded(props.post.id as number)
              ? props.post.description ?? ""
              : (props.post.description ?? "").slice(0, 300) +
                ((props.post.description?.length ?? 0) > 300 ? "..." : "")
          }}
        </p>
      </div>

      <div class="d-flex justify-content-end">
        <Button
          v-if="
            (props.post.description?.length ?? 0) > 255 &&
            props.post.id !== undefined
          "
          variant="link"
          @click="togglePostExpand(props.post.id as number)"
        >
          {{
            isPostExpanded(props.post.id as number) ? "Show Less" : "Show More"
          }}
        </Button>
      </div>
    </div>

    <!-- Rank Row -->
    <div class="pb-2">
      <div class="rank-box d-flex align-items-center p-2 gap-1">
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
  </div>
</template>

<style></style>
