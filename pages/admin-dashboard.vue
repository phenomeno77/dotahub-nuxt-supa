<script lang="ts" setup>
import type { UpdateUser } from "~/types/UpdateUser";
import { UserRole, UserStatus } from "~/utils/enums";
import notifications from "~/utils/notifications";

definePageMeta({
  middleware: "auth-admin-dashboard",
});

const users = ref();
const loadingUsers = ref(true);
const toast = useToast();
const roles = Object.values(UserRole);
const statuses = Object.values(UserStatus);
const loadingStore = useLoadingStore();

const fetchUsers = async () => {
  try {
    const response = await $fetch("/api/auth/admin/users", {
      method: "GET",
    });
    users.value = response;
  } catch (error: any) {
    notifications(
      toast,
      "warn",
      "Fetching Users Failed",
      error.statusMessage,
      3000
    );
    loadingUsers.value = false;
  }
};

const updateUser = async (newData: UpdateUser) => {
  try {
    const response = await $fetch("/api/auth/admin/update-user", {
      method: "POST",
      body: { newData },
    });

    if (response.success) {
      const userIndex = users.value.findIndex(
        (u: UpdateUser) => u.id === newData.id
      );
      if (userIndex !== -1) {
        users.value[userIndex] = { ...newData }; // Ensure reactivity
      }

      notifications(toast, "success", "User created successfully!");
      loadingStore.startLoading();
    }
  } catch (error: any) {
    const message = error?.statusMessage;
    notifications(toast, "warn", "Update failed", message, 3000);
  } finally {
    loadingStore.stopLoading();
  }
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
