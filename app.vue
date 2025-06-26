<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import CreatePost from "~/components/posts/CreatePost.vue";

const { loggedIn, user } = useUserSession();
const config = useRuntimeConfig();
const route = useRoute();
const loading = useLoadingStore();
const isHomePage = computed(() => route.path === "/");
const isProfilePage = computed(() => route.path === "/my-posts");
const showPremiumDialog = usePremiumDialog();
const createPostDialog = useCreatePostDialog();

useHead({
  title: config.public.appName,
});

const layoutColumns = computed(() => {
  if (isHomePage.value || isProfilePage.value) {
    return {
      left: "col-md-3 d-none d-md-block",
      center: "col-md-6 col-10  p-0",
      right: "col-md-3 d-none d-md-block",
    };
  } else {
    return {
      left: false,
      center: "col-12 p-0",
      right: false,
    };
  }
});

// onMounted(() => {
//   auth.checkAuth();

//   const updateDarkMode = (matches: boolean) => {
//     document.body.classList.toggle('dark', matches);
//   };

//   const match = window.matchMedia('(prefers-color-scheme: dark)');
//   updateDarkMode(match.matches);
//   match.addEventListener('change', e => updateDarkMode(e.matches));
// });

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
  <ConfirmDialog />

  <div v-show="loading.isLoading" class="loading-overlay">
    <ProgressSpinner />
  </div>

  <PremiumPlan v-if="showPremiumDialog" />
  <CreatePost v-if="createPostDialog" />
  <div class="container-fluid d-flex flex-column h-100">
    <NuxtLayout>
      <main
        class="position-absolute start-0 end-0"
        style="top: 9%; bottom: 3%; overflow-y: auto"
      >
        <div class="container-fluid h-100">
          <div class="row justify-content-center h-100">
            <div v-if="layoutColumns.left" :class="layoutColumns.left"></div>
            <div :class="layoutColumns.center">
              <NuxtPage />
            </div>
            <div v-if="layoutColumns.right" :class="layoutColumns.right"></div>
          </div>
        </div>
      </main>
    </NuxtLayout>
  </div>
</template>

<style></style>
