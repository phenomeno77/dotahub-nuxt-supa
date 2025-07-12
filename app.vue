<script lang="ts" setup>
import CreatePost from "~/components/posts/CreatePost.vue";
import { useHeartbeat } from "~/composables/useHeartbeat";

const config = useRuntimeConfig();
const loading = useLoadingStore();
const showPremiumDialog = usePremiumDialog();
const createPostDialog = useCreatePostDialog();
useHeartbeat();

useHead({
  title: config.public.appName,
});

useSeoMeta({
  title: "Dota 2 Party Finder - Connect with Ranked Players",
  description:
    "Find and team up with Dota 2 players matching your rank and preferred positions. Post looking-for-party ads and chat to build your ideal ranked team!",

  ogTitle: "Dota 2 Party Finder - Join Ranked Parties Easily",
  ogDescription:
    "Looking to climb the ranks? Connect with Dota 2 players by rank range and position. Post, comment, and form your perfect team!",
  ogImage: "https://yourdomain.com/images/dota2-party-finder-og.png", // Replace with your actual URL
  ogUrl: "https://yourdomain.com", // Replace with your actual site URL

  twitterTitle: "Dota 2 Party Finder - Connect with Ranked Players",
  twitterDescription:
    "Post LFP ads, find teammates by rank & position, and chat with players to win your ranked games!",
  twitterImage: "https://yourdomain.com/images/dota2-party-finder-twitter.png", // Replace accordingly
  twitterCard: "summary_large_image",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "icon",
      type: "image/png",
      href: "",
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
          background: 'var(--background-color)',
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

  <PremiumPlan v-if="showPremiumDialog" />
  <CreatePost v-if="createPostDialog" />
  <div class="container-fluid d-flex flex-column h-100">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style></style>
