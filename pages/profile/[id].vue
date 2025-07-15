<script setup lang="ts">
import { useRoute } from "vue-router";
import UserPostFeed from "~/components/user/UserPostFeed.vue";

definePageMeta({
  middleware: "auth-logged-in-user",
});

const route = useRoute();
const userId = route.params.id as string;
</script>

<template>
  <UserPostFeed :user-id="userId" />
</template>
