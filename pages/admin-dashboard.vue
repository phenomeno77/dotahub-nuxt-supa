<script lang="ts" setup>
definePageMeta({
  middleware: "auth-admin-dashboard",
});

const user = await useCurrentUser();
</script>

<template>
  <div v-if="user">{{ user }}</div>
  <div>Hello admin!</div>
</template>
