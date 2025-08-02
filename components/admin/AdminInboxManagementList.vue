<script lang="ts" setup>
import type { UserFeedback } from "~/types/UserFeedback";
import notifications from "@/utils/notifications";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "@primevue/core/api";
import { labels, buttons, fixed_values } from "~/constants/labels";
import { getFeedbackLabel, getFeedbackStatusLabel } from "~/types/enums";
import type DataTable from "primevue/datatable";

const {
  items: feedbacks,
  total,
  fetchPage,
} = usePaginatedFetch<UserFeedback>("/api/auth/admin/feedback");

const loadingFeedbacks = ref(false);
const loadingStore = useLoadingStore();
const toast = useToast();
const expandedRows = ref({});
const editingRows = ref([]);
const lastPageEvent = ref({ page: 0, rows: fixed_values.ROWS_PER_PAGE });
const statuses = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
];

const types = [
  { label: "Bug report", value: "bug_report" },
  { label: "User report", value: "user_report" },
  { label: "Feature request", value: "feature_request" },
  { label: "General feedback", value: "general_feedback" },
];

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  "user.username": { value: null, matchMode: FilterMatchMode.CONTAINS },
  "user.steamId": { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.CONTAINS },
  message: { value: null, matchMode: FilterMatchMode.CONTAINS },
  createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
});

const globalFilterFields = ref(
  Object.keys(filters.value).filter((key) => key !== "global")
);

const feedbacksWithDates = computed(() =>
  feedbacks.value.map((fb) => ({
    ...fb,
    createdAt: new Date(fb.createdAt),
  }))
);

const formatDate = (value: Date | string) => {
  const date = new Date(value);
  return date.toLocaleDateString("de-DE");
};

const onPage = async (event: { page: number; rows: number }) => {
  lastPageEvent.value = event;
  loadingFeedbacks.value = true;
  await fetchPage(event.page, event.rows);
  loadingFeedbacks.value = false;
};

const refreshPage = async () => {
  loadingFeedbacks.value = true;
  await fetchPage(lastPageEvent.value.page, lastPageEvent.value.rows);
  loadingFeedbacks.value = false;
};

const getSeverityStatus = (status: string) => {
  switch (status) {
    case "resolved":
      return "success";
    case "open":
      return "warn";
    case "in_progress":
      return "info";
    default:
      return "contrast";
  }
};

function filteredFeedbacks(id: number) {
  return feedbacks.value.filter((fb) => fb.id === id);
}

const onRowEditSave = (event: { newData: any; data: any }) => {
  const { newData, data } = event;

  if (newData.status === data.status) {
    return;
  }

  const updatePayload = { id: newData.id, status: newData.status };

  updateFeedback(updatePayload);
};

const updateFeedback = async (newData: any) => {
  loadingStore.startLoading();
  try {
    const response = await $fetch<{
      success: boolean;
      feedback: UserFeedback;
    }>(`/api/auth/admin/feedback/${newData.id}`, {
      method: "PUT",
      body: { newData },
    });
    if (response.success) {
      const updatedFeedback = response.feedback;

      const feedbackIndex = feedbacks.value.findIndex(
        (u: UserFeedback) => u.id === updatedFeedback.id
      );

      if (feedbackIndex !== -1) {
        Object.assign(feedbacks.value[feedbackIndex], updatedFeedback);
      }

      notifications(toast, "success", "Feedback Updated successfully!");
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
  fetchPage(0, fixed_values.ROWS_PER_PAGE);
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
      <div id="placeholder-div" style="min-width: 300px"></div>
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
        :value="feedbacksWithDates"
        paginator
        :lazy="true"
        :rows="fixed_values.ROWS_PER_PAGE"
        dataKey="id"
        :totalRecords="total"
        @page="onPage"
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
        <Column
          header="Username"
          sortable
          sortField="user.username"
          filterField="user.username"
        >
          <template #body="{ data }">
            {{ data.user.username }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Search by username"
            />
          </template>
        </Column>

        <!-- STEAMID COLUMN -->
        <Column
          header="Steam ID"
          sortable
          sortField="user.steamId"
          filterField="user.steamId"
        >
          <template #body="{ data }"> {{ data.user.steamId }} </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Search by Steam ID"
            />
          </template>
        </Column>

        <Column field="type" header="Feedback Type" sortable>
          <template #body="{ data }">
            <Tag :value="getFeedbackLabel(data.type)" severity="secondary" />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Select
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="types"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Type"
            />
          </template>
        </Column>

        <Column field="status" header="Status" sortable>
          <template #body="{ data }">
            <Tag
              :value="getFeedbackStatusLabel(data.status)"
              :severity="getSeverityStatus(data.status)"
            />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Select
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="statuses"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Status"
            />
          </template>

          <template #editor="{ data, field }">
            <Select
              v-model="data[field]"
              :options="statuses"
              optionLabel="label"
              optionValue="value"
              placeholder="Select status"
              fluid
            >
            </Select>
          </template>
        </Column>

        <Column
          field="createdAt"
          header="Date"
          sortable
          dataType="date"
          filterField="createdAt"
        >
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <DatePicker
              v-model="filterModel.value"
              @update:modelValue="filterCallback"
              placeholder="dd.mm.yyyy"
              dateFormat="dd.mm.yy"
              style="width: 7rem"
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

        <template #expansion="slotProps">
          <div class="p-3">
            <DataTable
              :value="filteredFeedbacks(slotProps.data.id)"
              :responsiveLayout="'scroll'"
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
                      border: 'none',
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
              <Column field="message" header="Feedback">
                <template #body="{ data }">
                  {{ data.message }}
                </template>
              </Column>
            </DataTable>
          </div>
        </template>
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
