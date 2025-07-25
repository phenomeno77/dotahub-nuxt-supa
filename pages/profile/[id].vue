<script setup lang="ts">
import { useRoute } from "vue-router";
import UserProfile from "~/components/user/UserProfile.vue";

definePageMeta({
  middleware: "auth-logged-in-user",
});

const route = useRoute();
const userId = route.params.id as string;
</script>

<template>
  <UserProfile :userId="userId" />
</template>
