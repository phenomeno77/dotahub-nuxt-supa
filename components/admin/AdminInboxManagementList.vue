<script lang="ts" setup>
import type { UserFeedback } from "~/types/UserFeedback";
import notifications from "@/utils/notifications";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "@primevue/core/api";
import { labels, buttons } from "~/constants/labels";
import { FeedbackStatus, FeedbackType } from "~/types/enums";

const loadingFeedbacks = ref(false);
const feedbacks = ref<UserFeedback[]>([]);
const loadingStore = useLoadingStore();
const toast = useToast();
const editingRows = ref([]);
const statuses = Object.values(FeedbackStatus);
const feedbackStatus = ref("");

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  username: { value: null, matchMode: FilterMatchMode.STARTS_WITH },

  //TODO: Add filters global
});

const globalFilterFields = ref(
  Object.keys(filters.value).filter((key) => key !== "global")
);

const fetchFeedbacks = async () => {
  loadingStore.startLoading();
  try {
    const response = await $fetch<UserFeedback[]>("/api/auth/admin/feedback", {
      method: "GET",
    });
    feedbacks.value = response;
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(toast, "warn", "Fetching Feedbacks Failed", message, 3000);

    loadingFeedbacks.value = false;
  } finally {
    loadingStore.stopLoading();
  }
};

const getSeverityStatus = (status: string) => {
  switch (status) {
    case "resolved":
      return "success";
    case "open":
      return "warn";
    case "in_progress":
      return "danger";
    default:
      return "contrast";
  }
};

const onRowEditSave = (event: { newData: any; data: any }) => {
  // const { newData, data } = event;
  // if (!newData.id) {
  //   notifications(toast, "error", "User ID is missing");
  //   return;
  // }
  // const updatePayload = { ...newData };
  // if (banData.value && userStatus.value === UserStatus.banned) {
  //   updatePayload.banReason = banData.value.banReason;
  //   updatePayload.banDuration = banData.value.banDuration;
  // } else if (userStatus.value === UserStatus.active) {
  //   updatePayload.userStatus = newData.userStatus;
  //   updatePayload.banReason = "";
  //   updatePayload.banDuration = "";
  // } else {
  //   updatePayload.banReason = "";
  //   updatePayload.banDuration = "";
  //   updatePayload.userStatus = data.userStatus;
  // }
  // banData.value = null;
  // updateUser(updatePayload);
};

const updateUser = async (newData: any) => {
  // loadingStore.startLoading();
  // try {
  //   const response = await $fetch<{
  //     success: boolean;
  //     user: UpdateUser;
  //   }>(`/api/auth/admin/user/${newData.id}`, {
  //     method: "PUT",
  //     body: { newData },
  //   });
  //   if (response.success) {
  //     const updatedUser = response.user;
  //     const userIndex = users.value.findIndex(
  //       (u: UserProfile) => u.id === updatedUser.id
  //     );
  //     if (userIndex !== -1) {
  //       Object.assign(users.value[userIndex], updatedUser);
  //     }
  //     notifications(toast, "success", "User Updated successfully!");
  //   }
  // } catch (error: any) {
  //   const message =
  //     error?.response?._data?.statusMessage ||
  //     error.statusMessage ||
  //     error.message ||
  //     "Unexpected error";
  //   notifications(toast, "warn", "Update failed", message, 3000);
  // } finally {
  //   loadingStore.stopLoading();
  // }
};

const onStatusChange = (event: any) => {
  feedbackStatus.value = event;
};

onMounted(async () => {
  await fetchFeedbacks();
  loadingFeedbacks.value = false;
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
          @click="fetchFeedbacks()"
          class="refresh-btn"
        />
      </div>
    </div>

    <!-- DATATABLE WRAPPER -->
    <div style="flex: 1; overflow: hidden">
      <DataTable
        v-model:filters="filters"
        :value="feedbacks"
        paginator
        :rows="15"
        dataKey="id"
        filterDisplay="row"
        :loading="loadingFeedbacks"
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
        <template #empty> No feedbacks found. </template>
        <template #loading> Loading feedbacks... </template>

        <Column expander style="width: 2rem" />
        <!-- USERNAME COLUMN -->
        <!-- <Column field="username" header="Username" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Search by username"
            />
          </template>
        </Column> -->

        <!-- STEAMID COLUMN -->
        <!-- <Column field="steamId" header="Steam ID" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Search by Steam ID"
            />
          </template>
        </Column> -->

        <!-- USER STATUS COLUMN -->
        <!-- <Column field="userStatus" header="Status" sortable>
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
        </Column> -->

        <!-- EDITOR BUTTON COLUMN -->
        <Column
          :rowEditor="true"
          style="width: 10%; min-width: 8rem"
          bodyStyle="text-align:center"
        >
        </Column>
      </DataTable>
    </div>
  </div>
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
