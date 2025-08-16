<script lang="ts" setup>
import { FilterMatchMode } from "@primevue/core/api";
import { labels, buttons, fixed_values } from "~/constants/labels";
import notifications from "@/utils/notifications";
import { useToast } from "primevue/usetoast";
import type { UpdateUser } from "~/types/UpdateUser";
import BanUserForm from "./BanUserForm.vue";
import AddUserForm from "./AddUserForm.vue";
import { UserRole, UserStatus } from "~/types/enums";
import { type BanRecord, type UserProfile } from "~/types/UserProfile";
import { useConfirm } from "primevue/useconfirm";

const { user: currentUser } = useUserSession();
const toast = useToast();
const roles = Object.values(UserRole);
const statuses = Object.values(UserStatus);
const loadingStore = useLoadingStore();
const loggedOrNot = ref([true, false]);
const editingRows = ref([]);
const showAddUserDialog = ref(false);
const showBanUserDialog = ref(false);
const banData = ref<{ banReason: string; banDuration: string } | null>(null);
const userStatus = ref("");
const expandedRows = ref({});
const banRecords = ref<Record<string, BanRecord[]>>({});
const loadingBanHistory = ref(false);
const users = ref<UserProfile[]>([]);
const confirm = useConfirm();

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
  return users.value.filter((u) => u.id !== String(currentUser.value.id));
});

const refreshPage = async () => {
  await fetchUsers();
};

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

const updateUser = async (newData: UpdateUser) => {
  loadingStore.startLoading();

  try {
    const response = await $fetch<{
      success: boolean;
      user: UpdateUser;
    }>(`/api/auth/admin/user/${newData.id}`, {
      method: "PUT",
      body: { newData },
    });

    if (response.success) {
      const updatedUser = response.user;

      const userIndex = users.value.findIndex(
        (u: UserProfile) => u.id === updatedUser.id
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

const onStatusChange = (event: any, id: string) => {
  userStatus.value = event;
  if (event === UserStatus.banned) {
    showBanUserDialog.value = true;
  }
};

const confirmDeleteUser = (id: string) => {
  confirm.require({
    message: labels.DELETE_USER_MESSAGE,
    header: labels.DELETE_USER_HEADER,
    icon: "pi pi-exclamation-triangle",
    rejectLabel: "Cancel",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: labels.DELETE_USER_DELETE,
      severity: "danger",
    },
    accept: () => {
      deleteUser(id);
    },
  });
};

const deleteUser = async (id: string) => {
  loadingStore.startLoading();
  try {
    const response = await $fetch<{
      success: boolean;
    }>(`/api/auth/admin/user/${id}`, {
      method: "DELETE",
    });

    if (response.success) {
      users.value = users.value.filter((user) => user.id !== id);
      notifications(
        toast,
        "info",
        labels.DELETE_USER_TOAST_SUMMARY,
        labels.DELETE_USER_TOAST_DETAIL
      );
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
  return userRole !== UserRole.user;
};

const onRowExpand = async (event: { data: UpdateUser }) => {
  const { id: userId } = event.data;

  if (userId && banRecords.value[userId]) return; // already fetched

  loadingStore.startLoading();
  loadingBanHistory.value = true;
  try {
    const response = await $fetch<BanRecord[]>(
      `/api/auth/admin/user/${userId}/ban-history`
    );

    if (!userId) {
      return;
    }

    banRecords.value[userId] = response;
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(toast, "warn", "Fetching Ban Records Failed", message, 3000);
  } finally {
    loadingStore.stopLoading();
    loadingBanHistory.value = false;
  }
};

const onRowCollapse = (event: { data: UpdateUser }) => {
  const { id: userId } = event.data;

  if (userId) {
    delete banRecords.value[userId];
  }
};

function isUserOnline(lastSeenAt: string | Date | null): boolean {
  if (!lastSeenAt) return false;
  const lastSeenDate = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - lastSeenDate.getTime();
  return diffMs < fixed_values.ONLINE_THRESHOLD_MINUTES * 60 * 1000; // less than 1 minutes ago
}

const fetchUsers = async () => {
  loadingStore.startLoading();

  try {
    const response = await $fetch<{
      success: boolean;
      users: UserProfile[];
    }>("/api/auth/admin/user", {
      method: "GET",
    });

    if (response.success) {
      users.value = response.users;
    }
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(toast, "warn", "Fetching Feedbacks Failed", message, 3000);
  } finally {
    loadingStore.stopLoading();
  }
};

onMounted(async () => {
  await fetchUsers();
});
</script>

<template>
  <div
    class="position-absolute start-0 end-0 d-flex flex-column"
    style="
      top: 80px;
      bottom: 40px;
      overflow: hidden;
      height: calc(100dvh - 120px);
    "
  >
    <!-- TOP BAR -->
    <div
      class="d-flex flex-wrap gap-2 w-100 border rounded-1 p-3 justify-content-between"
      style="background-color: var(--background-color); flex-shrink: 0"
    >
      <div id="add-user-btn" style="min-width: 300px">
        <Button
          :label="labels.ADD_NEW_USER"
          @click="showAddUserDialog = true"
          icon="pi pi-plus"
          class="add-new-user-btn w-100"
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
      </div>

      <div class="d-flex gap-2 end-btn-wrapper">
        <Button
          :label="buttons.BACK_TO_DASHBOARD"
          outlined
          @click="navigateTo('/admin')"
          icon="pi pi-arrow-left"
          class="back-dashboard-btn"
        />

        <Button
          icon="pi pi-refresh"
          outlined
          @click="refreshPage"
          class="refresh-btn"
        />
      </div>
    </div>

    <!-- DATATABLE WRAPPER -->
    <div style="flex: 1; overflow: hidden">
      <DataTable
        v-model:filters="filters"
        v-model:expandedRows="expandedRows"
        :value="filteredUsersNoCurrentUser"
        @rowExpand="onRowExpand"
        @rowCollapse="onRowCollapse"
        paginator
        :rows="fixed_values.ROWS_PER_PAGE"
        dataKey="id"
        filterDisplay="row"
        :loading="loadingStore.isLoading"
        :globalFilterFields="globalFilterFields"
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
          rowExpansion: {
            style: {
              background: 'var(--background-color)',
              color: 'var(--text-color)',
            },
          },
        }"
      >
        <template #empty>
          <span v-if="!loadingStore.isLoading">
            No users found.
          </span></template
        >
        <template #loading> Loading users... </template>

        <Column expander style="width: 1rem" />
        <!-- USERNAME COLUMN -->
        <Column field="username" header="Username" sortable style="width: 25%">
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Search by username"
            />
          </template>

          <template #editor="{ data, field }">
            <InputText
              v-if="isEditableUsername(data.role)"
              v-model="data[field]"
              style="white-space: normal; word-wrap: break-word"
            />
            <div v-else style="white-space: normal; word-wrap: break-word">
              {{ data.username }}
            </div>
          </template>

          <template #body="{ data }">
            <div style="white-space: normal; word-wrap: break-word">
              {{ data.username }}
            </div>
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
              @value-change="onStatusChange($event, data.id)"
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
          style="min-width: 7rem"
          bodyStyle="text-align:center"
        >
        </Column>
        <Column bodyStyle="text-align:center">
          <template #body="{ data }">
            <Button
              severity="danger"
              icon="pi pi-trash"
              variant="text"
              rounded
              @click="confirmDeleteUser(data.id)"
            /> </template
        ></Column>

        <template #expansion="slotProps">
          <div class="p-3">
            <h5 class="mb-3">Ban History for {{ slotProps.data.username }}</h5>

            <DataTable
              :value="banRecords[slotProps.data.id]"
              :responsiveLayout="'scroll'"
              :loading="loadingBanHistory"
              class="p-datatable-sm"
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
                emptyMessageCell: {
                  style: {
                    background: 'var(--background-color)',
                    color: 'var(--text-color)',
                    borderBottom: 'none',
                  },
                },
              }"
            >
              <template #empty>
                <div v-if="!loadingBanHistory">No ban history found.</div>
              </template>

              <template #loading> Loading ban history... </template>

              <!-- Render columns only if there is data -->
              <template v-if="banRecords[slotProps.data.id]?.length">
                <Column field="reason" header="Reason" />

                <Column field="bannedAt" header="Banned At">
                  <template #body="colSlot">
                    {{ new Date(colSlot.data.bannedAt).toLocaleString() }}
                  </template>
                </Column>

                <Column field="banExpiration" header="Expires At">
                  <template #body="colSlot">
                    {{
                      colSlot.data.banExpiration
                        ? new Date(colSlot.data.banExpiration).toLocaleString()
                        : "Permanent"
                    }}
                  </template>
                </Column>

                <Column field="bannedBy.username" header="Banned By">
                  <template #body="colSlot">
                    {{ colSlot.data.bannedBy?.username || "Unknown" }}
                  </template>
                </Column>
              </template>
            </DataTable>
          </div>
        </template>
      </DataTable>
    </div>
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
  min-width: 300px;
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .add-new-user-btn {
    width: 100%;
  }

  .end-btn-wrapper {
    width: 100%;
  }

  .back-dashboard-btn {
    display: flex;
    flex-grow: 1;
  }

  .refresh-btn {
    flex-shrink: 1;
  }

  .button-wrapper,
  .search-wrapper {
    width: 100%;
    max-width: none;
  }
}
</style>
