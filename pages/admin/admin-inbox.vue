<script lang="ts" setup>
import AdminInbox from "~/components/admin/AdminInbox.vue";

definePageMeta({
  middleware: "auth-admin-dashboard",
});
</script>

<template>
  <AdminInbox />
</template>

<style></style>
