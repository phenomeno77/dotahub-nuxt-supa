<script setup lang="ts">
import type { Comment } from "~/types/Post";
import PostCommentItem from "./PostCommentItem.vue";
import CommentSkeleton from "./CommentSkeleton.vue";

const props = withDefaults(
  defineProps<{
    comments: Comment[];
    isLoadingInit: boolean;
    isLoadingMore: boolean;
    skeletonCount?: number;
    postUserId: string;
  }>(),
  {
    skeletonCount: 5,
  }
);

const emits = defineEmits(["comment-deleted"]);
const addingComment = defineModel("addingComment", {
  type: Boolean,
  default: false,
});
</script>

<template>
  <div
    class="pb-2"
    v-for="comment in comments"
    :key="comment.id"
    v-if="!addingComment"
  >
    <PostCommentItem
      :comment="comment"
      :postUserId="props.postUserId"
      @comment-deleted="emits('comment-deleted', comment)"
    />
  </div>

  <CommentSkeleton
    v-if="props.isLoadingInit || props.isLoadingMore || addingComment"
    v-for="n in props.skeletonCount"
    :key="'skeleton-' + n"
    class="mb-3"
  />
</template>
