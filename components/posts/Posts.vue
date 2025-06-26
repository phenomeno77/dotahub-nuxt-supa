<script setup lang="ts">
import type { Post } from "~/types/Post";
import PostItem from "~/components/posts/PostItem.vue";
const props = defineProps<{
  posts: Post[];
}>();
</script>

<template>
  <div class="py-4">
    <PostItem v-for="post in props.posts" :key="post.id" :post />
  </div>
</template>
