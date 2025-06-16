<script lang="ts" setup>
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  middleware: "auth-admin-dashboard",
});

const authStore = useAuthStore();
</script>

<template>
  <div>
    <div>{{ authStore.userRole }}</div>
    <div>Hello admin!</div>
  </div>
</template>
