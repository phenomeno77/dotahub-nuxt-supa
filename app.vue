<script lang="ts" setup>
import CreatePost from "~/components/posts/CreatePost.vue";
import { useHeartbeat } from "~/composables/useHeartbeat";

const config = useRuntimeConfig();
const loading = useLoadingStore();
const createPostDialog = useCreatePostDialog();
useHeartbeat();

useHead({
  title: config.public.appName,
});

useSeoMeta({
  title: "Dota 2 Party Finder | Find Teammates by Rank & Role",
  description:
    "Find Dota 2 teammates fast! Post ads, filter by rank & position, and build your dream team for ranked games.",

  ogTitle: "Find Your Next Dota 2 Teammates",
  ogDescription:
    "Use Party Finder to connect with players by rank & role. Post LFP ads and join the perfect squad.",
  ogImage: "https://yourdomain.com/images/dota2-party-finder-og.png",
  ogUrl: "https://yourdomain.com",

  twitterTitle: "Looking for Dota 2 Teammates?",
  twitterDescription:
    "Post LFP ads, filter by rank & role, and find your ideal party. Join now and start climbing ranked together!",
  twitterImage: "https://yourdomain.com/images/dota2-party-finder-twitter.png",
  twitterCard: "summary_large_image",
});

useHead({
  htmlAttrs: { lang: "en" },
  link: [
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.ico",
    },
  ],
});
</script>
<template>
  <Toast />
  <ConfirmDialog
    :pt="{
      root: {
        style: {
          background: 'var(--bg-post)',
          color: 'var(--text-color)',
          border: 'none',
        },
      },
      icon: {
        style: {
          color: 'var(--text-color)',
        },
      },
      pcRejectButton: {
        root: {
          style: {
            color: 'var(--text-color)',
          },
        },
      },
    }"
  />
  <div v-show="loading.isLoading" class="loading-overlay">
    <ProgressSpinner />
  </div>

  <div class="container-fluid d-flex flex-column h-100">
    <CreatePost v-if="createPostDialog" />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style></style>
