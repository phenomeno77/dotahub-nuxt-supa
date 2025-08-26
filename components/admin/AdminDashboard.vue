<script setup lang="ts">
import { buttons, labels } from "~/constants/labels";
import { useToast } from "primevue/usetoast";

const loadingStore = useLoadingStore();
const totalUsersCount = ref(0);
const totalUsersOnline = ref(0);
const toast = useToast();

const totalOpenFeedbacks = ref(0);
const totalInProgressFeedbacks = ref(0);
const totalFeedbacks = ref(0);

const fetchUsersSummary = async () => {
  try {
    const response = await $fetch<{
      success: boolean;
      totalUsersOnline: number;
      totalUsersCount: number;
    }>("/api/auth/admin/user/getUserSummary");

    totalUsersCount.value = response.totalUsersCount;
    totalUsersOnline.value = response.totalUsersOnline;
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(
      toast,
      "warn",
      "Fetching Users Summary Failed",
      message,
      3000
    );
  }
};

const fetchFeedbackSummary = async () => {
  try {
    const response = await $fetch<{
      success: boolean;
      totalOpenFeedbacks: number;
      totalInProgressFeedbacks: number;
      totalFeedbacks: number;
    }>("/api/auth/admin/user/getFeedbackSummary");

    totalOpenFeedbacks.value = response.totalOpenFeedbacks;
    totalInProgressFeedbacks.value = response.totalInProgressFeedbacks;
    totalFeedbacks.value = response.totalFeedbacks;
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(
      toast,
      "warn",
      "Fetching Feedbacks Summary Failed",
      message,
      3000
    );
  }
};

onMounted(async () => {
  loadingStore.startLoading();

  try {
    await fetchUsersSummary();
    await fetchFeedbackSummary();
  } finally {
    loadingStore.stopLoading();
  }
});
</script>

<template>
  <div
    class="absolute inset-x-0 py-4 overflow-y-auto"
    style="top: 80px; bottom: 40px"
  >
    <div class="flex px-4 flex-wrap gap-4 justify-center">
      <!-- User Management Card -->
      <div class="w-full md:w-1/2">
        <Card
          class="h-full shadow rounded-xl border-0"
          style="background-color: var(--bg-post)"
        >
          <template #title>
            <span
              class="text-xl font-semibold"
              style="color: var(--text-color)"
            >
              {{ buttons.USER_MANAGEMENT }}
            </span>
          </template>

          <template #content>
            <div class="flex flex-wrap gap-3 pt-2">
              <!-- Users Online Mini Card -->
              <div
                class="flex-1 border rounded-lg p-3 flex flex-col items-start justify-center min-w-[140px]"
                style="background-color: var(--background-color)"
              >
                <span class="text-sm" style="color: var(--text-color)"
                  >Users Online</span
                >
                <span
                  class="text-2xl font-bold"
                  style="color: var(--text-color)"
                >
                  {{ totalUsersOnline }}
                </span>
              </div>

              <!-- Total Users Mini Card -->
              <div
                class="flex-1 border rounded-lg p-3 flex flex-col items-start justify-center min-w-[140px]"
                style="background-color: var(--background-color)"
              >
                <span class="text-sm" style="color: var(--text-color)"
                  >Total Users</span
                >
                <span
                  class="text-2xl font-bold"
                  style="color: var(--text-color)"
                >
                  {{ totalUsersCount }}
                </span>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="flex justify-end mt-3">
              <Button
                :label="buttons.MANAGE"
                icon="pi pi-users"
                @click="navigateTo('/admin/user-management')"
              />
            </div>
          </template>
        </Card>
      </div>

      <!-- Feedback Card -->
      <div class="w-full md:w-1/2">
        <Card
          class="h-full shadow rounded-xl border-0"
          style="background-color: var(--bg-post)"
        >
          <template #title>
            <span
              class="text-xl font-semibold"
              style="color: var(--text-color)"
            >
              {{ labels.INBOX }}
            </span>
          </template>

          <template #content>
            <div class="flex flex-wrap gap-3 pt-2">
              <!-- Open Feedbacks Mini Card -->
              <div
                class="flex-1 border rounded-lg p-3 flex flex-col items-start justify-center min-w-[140px]"
                style="background-color: var(--background-color)"
              >
                <span class="text-sm" style="color: var(--text-color)"
                  >Open</span
                >
                <span
                  class="text-2xl font-bold"
                  style="color: var(--text-color)"
                >
                  {{ totalOpenFeedbacks }}
                </span>
              </div>

              <!-- In Progress Feedbacks Mini Card -->
              <div
                class="flex-1 border rounded-lg p-3 flex flex-col items-start justify-center min-w-[140px]"
                style="background-color: var(--background-color)"
              >
                <span class="text-sm" style="color: var(--text-color)"
                  >In Progress</span
                >
                <span
                  class="text-2xl font-bold"
                  style="color: var(--text-color)"
                >
                  {{ totalInProgressFeedbacks }}
                </span>
              </div>

              <!-- Total Feedbacks Mini Card -->
              <div
                class="flex-1 border rounded-lg p-3 flex flex-col items-start justify-center min-w-[140px]"
                style="background-color: var(--background-color)"
              >
                <span class="text-sm" style="color: var(--text-color)"
                  >Total</span
                >
                <span
                  class="text-2xl font-bold"
                  style="color: var(--text-color)"
                >
                  {{ totalFeedbacks }}
                </span>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="flex justify-end mt-3">
              <Button
                :label="buttons.VIEW"
                icon="pi pi-inbox"
                @click="navigateTo('/admin/admin-inbox')"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
