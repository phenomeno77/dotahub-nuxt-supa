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
  <div class="pb-2" v-for="comment in comments" :key="comment.id">
    <PostCommentItem :comment="comment" />
  </div>

  <CommentSkeleton
    v-if="isLoading"
    v-for="n in skeletonCount"
    :key="'skeleton-' + n"
    class="mb-3"
  />
</template>
