<script setup lang="ts">
import { buttons, labels } from "~/constants/labels";

const userCount = ref(0);
const latestUsers = ref([]);
const feedbackCount = ref(0);
const latestFeedback = ref([]);

// onMounted(async () => {
//   const userData = await $fetch('/api/admin/users/summary');
//   userCount.value = userData.count;
//   latestUsers.value = userData.latest;

//   const feedbackData = await $fetch('/api/admin/feedback/summary');
//   feedbackCount.value = feedbackData.count;
//   latestFeedback.value = feedbackData.latest;
// });
</script>

<template>
  <div
    class="container position-absolute start-0 end-0 py-4"
    style="top: 80px; bottom: 40px"
  >
    <div class="row g-4">
      <!-- User Management Card -->
      <div class="col-md-6">
        <Card class="h-100 shadow-sm" style="background-color: var(--bg-post)">
          <template #title>
            <span style="color: var(--text-color)">{{
              buttons.USER_MANAGEMENT
            }}</span>
          </template>
          <template #footer>
            <Button
              :label="buttons.MANAGE"
              icon="pi pi-users"
              class="btn-sm"
              @click="navigateTo('/admin/user-management')"
            />
          </template>
        </Card>
      </div>

      <!-- Feedback Card -->
      <div class="col-md-6">
        <Card class="h-100 shadow-sm" style="background-color: var(--bg-post)">
          <template #title>
            <span style="color: var(--text-color)">{{
              labels.INBOX
            }}</span></template
          >
          <template #footer>
            <Button
              :label="buttons.VIEW"
              icon="pi pi-inbox"
              class="btn-sm"
              @click="navigateTo('/admin/admin-inbox')"
            />
          </template>
        </Card>
      </div>

      <!-- Add more cards as needed -->
    </div>
  </div>
</template>
