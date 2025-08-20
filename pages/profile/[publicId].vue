<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import UserProfile from "~/components/user/UserProfile.vue";

definePageMeta({
  middleware: "auth-logged-in-user",
});
</script>

<template>
  <UserProfile />
</template>
