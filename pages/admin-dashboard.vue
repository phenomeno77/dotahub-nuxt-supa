<script lang="ts" setup>
import type { UserProfile } from "~/types/userProfile";

definePageMeta({
  middleware: "auth-admin-dashboard",
});

const user = useState("currentUser");
</script>

<template>
  <div v-if="user">{{ user }}</div>
  <div>Hello admin!</div>
</template>
