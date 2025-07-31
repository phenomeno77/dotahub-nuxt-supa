<script lang="ts" setup>
import AdminInboxManagementList from "~/components/admin/AdminInboxManagementList.vue";

definePageMeta({
  middleware: "auth-admin-dashboard",
});
</script>

<template>
  <AdminInboxManagementList />
</template>

<style></style>
