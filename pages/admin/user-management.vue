<script lang="ts" setup>
import AdminUserManagementList from "~/components/admin/AdminUserManagementList.vue";

definePageMeta({
  middleware: "auth-admin-dashboard",
});
</script>

<template>
  <AdminUserManagementList />
</template>

<style></style>
