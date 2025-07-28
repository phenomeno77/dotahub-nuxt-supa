<script lang="ts" setup>
import { FilterMatchMode } from "@primevue/core/api";
import { labels, buttons } from "~/constants/labels";
import notifications from "@/utils/notifications";
import { useToast } from "primevue/usetoast";
import type { UpdateUser } from "~/types/UpdateUser";
import BanUserForm from "./BanUserForm.vue";
import AddUserForm from "./AddUserForm.vue";
import { UserRole, UserStatus } from "~/types/enums";
import type { UserProfile } from "~/types/UserProfile";

const users = ref<UserProfile[]>([]);
const loadingUsers = ref(true);
const toast = useToast();
const roles = Object.values(UserRole);
const statuses = Object.values(UserStatus);
const loadingStore = useLoadingStore();
const ONLINE_THRESHOLD_MINUTES = 5;
const authStore = useAuthStore();
const loggedOrNot = ref([true, false]);
const editingRows = ref([]);
const showAddUserDialog = ref(false);
const showBanUserDialog = ref(false);
const banData = ref<{ banReason: string; banDuration: string } | null>(null);
const userStatus = ref("");

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  username: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  steamId: { value: null, matchMode: FilterMatchMode.EQUALS },
  role: { value: null, matchMode: FilterMatchMode.EQUALS },
  userStatus: { value: null, matchMode: FilterMatchMode.EQUALS },
  lastSeenAt: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const globalFilterFields = ref(
  Object.keys(filters.value).filter((key) => key !== "global")
);

const filteredUsersNoCurrentUser = computed(() => {
  return users.value.filter((user) => user.id !== String(authStore.userId));
});

const getSeverityStatus = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "banned":
      return "warn";
    case "deleted":
      return "danger";
    default:
      return "contrast";
  }
};

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
    const response = await $fetch<{
      success: boolean;
      user: UpdateUser;
    }>(`/api/auth/admin/${newData.id}`, {
      method: "PUT",
      body: { newData },
    });

    if (response.success) {
      const updatedUser = response.user;

      console.log(updatedUser);

      const userIndex = users.value.findIndex(
        (u: UpdateUser) => u.id === updatedUser.id
      );

      if (userIndex !== -1) {
        Object.assign(users.value[userIndex], updatedUser);
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

const onStatusChange = (event: any) => {
  userStatus.value = event;
  if (event === UserStatus.banned) {
    showBanUserDialog.value = true;
  }
};

const submitBan = (banDataIn: { banReason: string; banDuration: string }) => {
  banData.value = banDataIn;
  showBanUserDialog.value = false;
};

const onRowEditSave = (event: { newData: UpdateUser; data: UpdateUser }) => {
  const { newData, data } = event;

  if (!newData.id) {
    notifications(toast, "error", "User ID is missing");
    return;
  }

  const updatePayload = { ...newData };

  if (banData.value && userStatus.value === UserStatus.banned) {
    updatePayload.banReason = banData.value.banReason;
    updatePayload.banDuration = banData.value.banDuration;
  } else if (userStatus.value === UserStatus.active) {
    updatePayload.userStatus = newData.userStatus;
    updatePayload.banReason = "";
    updatePayload.banDuration = "";
  } else {
    updatePayload.banReason = "";
    updatePayload.banDuration = "";
    updatePayload.userStatus = data.userStatus;
  }

  banData.value = null;
  updateUser(updatePayload);
};

const isEditableUsername = (userRole: string) => {
  return userRole === UserRole.user;
};

function isUserOnline(lastSeenAt: string | Date | null): boolean {
  if (!lastSeenAt) return false;
  const lastSeenDate = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - lastSeenDate.getTime();
  return diffMs < ONLINE_THRESHOLD_MINUTES * 60 * 1000; // less than 5 minutes ago
}

onMounted(async () => {
  await fetchUsers();
  loadingUsers.value = false;
});
</script>

<template>
  <div
    class="position-absolute start-0 end-0"
    style="
      top: 80px;
      bottom: 40px;
      overflow-y: auto;
      height: calc(100dvh - 120px);
    "
  >
    <DataTable
      v-model:filters="filters"
      :value="filteredUsersNoCurrentUser"
      paginator
      :rows="8"
      dataKey="id"
      filterDisplay="row"
      :loading="loadingUsers"
      :globalFilterFields="globalFilterFields"
      :virtualScrollerOptions="{ itemSize: 30 }"
      responsiveLayout="scroll"
      v-model:editingRows="editingRows"
      editMode="row"
      removableSort
      scrollable
      scrollHeight="flex"
      @row-edit-save="onRowEditSave"
      :pt="{
        bodyRow: {
          style: {
            background: 'var(--background-color)',
            color: 'var(--text-color)',
          },
        },
        header: {
          style: {
            background: 'var(--background-color)',
          },
        },

        column: {
          headerCell: {
            style: {
              background: 'var(--background-color)',
              color: 'var(--text-color)',
            },
          },
        },
        pcPaginator: {
          root: {
            style: {
              background: 'var(--background-color)',
              color: 'var(--text-color)',
              border: 'none',
            },
          },
        },
      }"
    >
      <template #header>
        <div class="action-bar mt-3">
          <div class="d-flex gap-1 w-100 action-bar-left">
            <Button
              :label="buttons.BACK_TO_DASHBOARD"
              severity="secondary"
              outlined
              @click="navigateTo('/admin')"
              icon="pi pi-arrow-left"
              class="button-wrapper"
            />

            <Button
              :label="labels.ADD_NEW_USER"
              @click="showAddUserDialog = true"
              icon="pi pi-plus"
              class="button-wrapper flex-grow-1"
            />
          </div>

          <div class="search-wrapper">
            <IconField class="w-100">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                :placeholder="labels.FILTER_KEYWORD_SEARCH"
                class="w-100"
              />
            </IconField>

            <Button
              icon="pi pi-refresh"
              outlined
              severity="secondary"
              @click="fetchUsers()"
            />
          </div>
        </div>
      </template>

      <template #empty> No users found. </template>
      <template #loading> Loading users... </template>

      <!-- USERNAME COLUMN -->
      <Column field="username" header="Username" sortable>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            @input="filterCallback()"
            placeholder="Search by username"
          />
        </template>
        <template #editor="{ data, field }">
          <InputText
            v-if="!isEditableUsername(data.role)"
            v-model="data[field]"
          />
          <td v-else>{{ data.username }}</td>
        </template>
      </Column>

      <!-- STEAMID COLUMN -->
      <Column field="steamId" header="Steam ID" sortable>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            @input="filterCallback()"
            placeholder="Search by Steam ID"
          />
        </template>
      </Column>

      <!-- ROLE COLUMN -->
      <Column field="role" header="Role" sortable>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="roles"
            placeholder="Select Role"
          />
        </template>
      </Column>

      <!-- USER STATUS COLUMN -->
      <Column field="userStatus" header="Status" sortable>
        <template #body="{ data }">
          <Tag
            :value="data.userStatus"
            :severity="getSeverityStatus(data.userStatus)"
          />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="statuses"
            placeholder="Select"
          />
        </template>
        <template #editor="{ data, field }">
          <Select
            v-model="data[field]"
            @value-change="onStatusChange"
            :options="statuses"
            placeholder="Select status"
            fluid
          >
          </Select>
        </template>
      </Column>

      <!-- IS ONLINE COLUMN -->
      <Column field="lastSeenAt" header="Online" sortable>
        <template #body="{ data }">
          <Tag
            :value="isUserOnline(data.lastSeenAt) ? 'Yes' : 'No'"
            :severity="isUserOnline(data.lastSeenAt) ? 'success' : 'warn'"
          />
        </template>

        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="loggedOrNot"
            placeholder="Select"
          />
        </template>
      </Column>

      <!-- EDITOR BUTTON COLUMN -->
      <Column
        :rowEditor="true"
        style="width: 10%; min-width: 8rem"
        bodyStyle="text-align:center"
      >
      </Column>
    </DataTable>
  </div>
  <AddUserForm
    v-model:showAddUserDialog="showAddUserDialog"
    @update-table="fetchUsers"
  />

  <BanUserForm
    v-model:showBanUserDialog="showBanUserDialog"
    @submit-ban="submitBan"
  />
</template>

<style scoped>
.action-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.button-wrapper,
.search-wrapper {
  max-width: 300px; /* optional for desktop constraint */
  display: flex;
  gap: 0.5rem;
}

.search-wrapper {
  flex-grow: 1;
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
  }

  .action-bar-left {
    flex-direction: column;
  }

  .button-wrapper,
  .search-wrapper {
    width: 100%;
    max-width: none;
  }
}
</style>
