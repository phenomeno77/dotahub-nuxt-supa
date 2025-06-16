<script lang="ts" setup>
import { UserRole, UserStatus } from "@prisma/client";
import notifications from "~/utils/notifications";

definePageMeta({
  middleware: "auth-admin-dashboard",
});

const users = ref();
const loadingUsers = ref(true);
const toast = useToast();
const roles = Object.values(UserRole).map((role) => ({
  label: role.charAt(0).toUpperCase() + role.slice(1),
  value: role,
}));

const statuses = Object.values(UserStatus).map((role) => ({
  label: role.charAt(0).toUpperCase() + role.slice(1),
  value: role,
}));

const fetchUsers = async () => {
  try {
    const response = await $fetch("/api/auth/admin/users", {
      method: "GET",
    });
    users.value = response;
  } catch (error: any) {
    notifications(toast, "warn", "Fetching Users Failed", error.message, 3000);
    loadingUsers.value = false;
  }
};

const updateUser = async () => {
  // const updateUser = async (userId: number, newData: User) => {
  // try {
  //   const response = await api.user.updateUser(userId, newData);
  //   if (response.status === 'ok') {
  //     const userIndex = users.value.findIndex((u) => u.id === userId);
  //     if (userIndex !== -1) {
  //       users.value[userIndex] = { ...newData }; // Ensure reactivity
  //     }
  //     notifications(toast, 'success', response.message);
  //     loadingStore.startLoading();
  //   }
  // } catch (error: any) {
  //   notifications(toast, 'warn', 'Update failed', error.message, 3000);
  // } finally {
  //   loadingStore.stopLoading();
  // }
};

onMounted(async () => {
  await fetchUsers();
  loadingUsers.value = false;
});
</script>

<template>
  <AdminUserManagementList
    :users="users"
    :roles="roles"
    :statuses="statuses"
    :loading="loadingUsers"
    @update-user="updateUser"
    @update-table="fetchUsers"
  />
</template>
