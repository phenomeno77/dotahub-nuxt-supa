<script lang="ts" setup>
import type { UpdateUser } from "~/types/UpdateUser";
import { UserRole, UserStatus } from "~/types/enums";
import notifications from "~/utils/notifications";
import AdminUserManagementList from "~/components/admin/AdminUserManagementList.vue";
import type { UserProfile } from "~/types/UserProfile";

definePageMeta({
  middleware: "auth-admin-dashboard",
});

const users = ref<UserProfile[]>([]);
const loadingUsers = ref(true);
const toast = useToast();
const roles = Object.values(UserRole);
const statuses = Object.values(UserStatus);
const loadingStore = useLoadingStore();

const fetchUsers = async () => {
  loadingStore.startLoading();
  try {
    const response = await $fetch<UserProfile[]>("/api/auth/admin", {
      method: "GET",
    });
    users.value = response;
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(toast, "warn", "Fetching Users Failed", message, 3000);

    loadingUsers.value = false;
  } finally {
    loadingStore.stopLoading();
  }
};

const updateUser = async (newData: UpdateUser) => {
  loadingStore.startLoading();

  try {
    const response = await $fetch<{ success: boolean; user: UpdateUser }>(
      `/api/auth/admin/${newData.id}`,
      {
        method: "PUT",
        body: { newData },
      }
    );

    if (response.success) {
      const userIndex = users.value.findIndex(
        (u: UpdateUser) => u.id === newData.id
      );
      if (userIndex !== -1) {
        Object.assign(users.value[userIndex], newData);
      }

      notifications(toast, "success", "User Updated successfully!");
    }
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

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
