<script setup lang="ts">
import type { Comment } from "~/types/Post";
import PostCommentItem from "./PostCommentItem.vue";
import CommentSkeleton from "./CommentSkeleton.vue";
import { fixed_values } from "~/constants/labels";

const props = withDefaults(
  defineProps<{
    comments: Comment[];
    skeletonCount?: number;
    postUserId: string;
    loadingMore: boolean;
  }>(),
  {
    skeletonCount: fixed_values.COMMENTS_PER_PAGE,
  }
);

const emits = defineEmits(["comment-deleted"]);
const addingComment = defineModel("addingComment", {
  type: Boolean,
  default: false,
});
const loadingStore = useLoadingStore();
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
    v-if="loadingStore.isLoading || addingComment || props.loadingMore"
    v-for="n in props.skeletonCount"
    :key="'skeleton-' + n"
  />
</template>
