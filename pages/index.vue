<script lang="ts" setup>
const showDialog = ref(false);
const { loggedIn } = useUserSession();

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
  <div>
    <div>
      <Button label="Add User" @click="showDialog = true" />
    </div>
    <div v-if="!loggedIn" class="mt-3">
      <Button
        label="Redirect to Admin Login"
        @click="navigateTo('/admin-login')"
      />
    </div>
    <AddUserForm v-model:showDialog="showDialog" />
  </div>
</template>

<style></style>
