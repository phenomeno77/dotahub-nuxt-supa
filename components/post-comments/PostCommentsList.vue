<script setup lang="ts">
import type { Comment } from "~/types/Post";
import PostCommentItem from "./PostCommentItem.vue";
import CommentSkeleton from "./CommentSkeleton.vue";

const props = defineProps<{
  comments: Comment[];
  isLoading: boolean;
  skeletonCount?: number;
}>();

const skeletonCount = props.skeletonCount ?? 5;
</script>

<template>
  <div class="px-3 pb-2">
    <div v-for="comment in comments" :key="comment.id">
      <PostCommentItem :comment="comment" />
    </div>

    <CommentSkeleton v-if="isLoading" :skeletonCount="skeletonCount" />
  </div>
</template>
