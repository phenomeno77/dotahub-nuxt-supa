<script lang="ts" setup>
// definePageMeta({
//   middleware: "auth-admin",
// });

const user = useSupabaseUser();
</script>

<template>
  <div v-if="user">{{ user }}</div>
  <div>Hello admin!</div>
</template>

<style></style>
