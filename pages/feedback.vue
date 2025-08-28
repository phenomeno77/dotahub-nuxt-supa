<script lang="ts" setup>
import UserFeedback from "~/components/feedback/UserFeedback.vue";
definePageMeta({
  middleware: "auth-logged-in-user",
});
</script>

<template>
  <UserFeedback />
</template>

<style></style>
