<script setup lang="ts">
import UserProfile from "~/components/user/UserProfile.vue";

definePageMeta({
  middleware: "auth-logged-in-user",
});
</script>

<template>
  <UserProfile />
</template>
