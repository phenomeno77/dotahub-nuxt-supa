<script setup>
import PostList from "~/components/posts/PostList.vue";
import ThreeColumnLayout from "~/components/layouts/ThreeColumnLayout.vue";
</script>

<template>
  <ThreeColumnLayout>
    <template #default>
      <PostList />
    </template>
  </ThreeColumnLayout>
</template>
