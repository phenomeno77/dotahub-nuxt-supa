<script setup lang="ts">
import { ref } from "vue";
import { FeedbackType } from "~/types/enums";
import { useToast } from "primevue/usetoast";
import { buttons, labels, errorMessage } from "~/constants/labels";

const type = ref<FeedbackType | null>(null);
const description = ref("");
const errors = ref<{ type?: string; description?: string }>({});
const toast = useToast();
const submitted = ref(false);
const feedbackTypeOptions = Object.entries(FeedbackType).map(
  ([key, value]) => ({
    label: value,
    value: key,
  })
);

const validate = () => {
  errors.value = {};
  if (!type.value) errors.value.type = errorMessage.FEEDBACK_TYPE_MISSING;
  if (!description.value || description.value.trim().length < 10)
    errors.value.description =
      errorMessage.FEEDBACK_DESCRIPTION_AT_LEAST_10_CHAR;
  return Object.keys(errors.value).length === 0;
};

const submitFeedback = async () => {
  if (!validate()) return;

  const feedback = {
    type: type.value,
    message: description.value,
  };

  try {
    const response = await $fetch("/api/user/feedback", {
      method: "POST",
      body: {
        feedback,
      },
    });
    if (response.success) {
      toast.add({
        severity: "success",
        summary: "Feedback submitted!",
        life: 3000,
      });

      type.value = null;
      description.value = "";
      submitted.value = true;
    }
  } catch (error) {
    toast.add({ severity: "error", summary: "Submission failed", life: 3000 });
  }
};
</script>

<template>
  <div
    class="d-flex justify-content-center align-items-center w-100 px-2 position-absolute start-0 end-0 overflow-auto"
    style="top: 80px; bottom: 40px"
  >
    <Card
      :pt="{
        root: {
          style: {
            background: 'var(--bg-post)',
            color: 'var(--text-color)',
            border: 'none',
            width: '40%',
            maxWidth: '800px',
            minWidth: '300px',
          },
        },
      }"
    >
      <template #title>
        <h4 class="text-center mb-1">
          {{ submitted ? labels.THANK_YOU_TITLE : labels.SEND_FEEDBACK }}
        </h4>
        <p class="text-center small">
          {{ submitted ? labels.THANK_YOU_TEXT : labels.FEEDBACK_TEXT }}
        </p>
      </template>

      <template #content>
        <div
          v-if="submitted"
          class="text-center p-3 d-flex flex-column gap-3 align-items-center"
        >
          <i
            class="pi pi-check-circle"
            style="font-size: 2.5rem; color: var(--rank-text)"
          />

          <div class="d-flex gap-3 mt-3 feedback-success-buttons">
            <Button
              :label="buttons.SUBMIT_ANOTHER_FEEDBACK"
              outlined
              severity="secondary"
              @click="
                () => {
                  submitted = false;
                  type = null;
                  description = '';
                }
              "
            />

            <Button
              icon="pi pi-home"
              :label="buttons.GO_TO_HOME"
              severity="primary"
              @click="
                () => {
                  navigateTo('/');
                }
              "
            />
          </div>
        </div>

        <div v-else class="d-flex flex-column gap-4">
          <!-- Feedback Type Dropdown -->
          <div>
            <label for="feedback-type" class="form-label fw-bold">{{
              labels.FEEDBACK_TYPE
            }}</label>
            <Select
              id="feedback-type"
              v-model="type"
              class="w-100"
              :options="feedbackTypeOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="labels.SELECT_FEEDBACK_TYPE"
            />
            <Message
              v-if="errors.type"
              severity="error"
              variant="simple"
              size="small"
            >
              {{ errors.type }}
            </Message>
          </div>

          <!-- Description -->
          <div class="position-relative">
            <FloatLabel variant="on">
              <label for="description">{{ labels.DESCRIPTION }}</label>
              <Textarea
                id="description"
                autoResize
                rows="6"
                class="w-100"
                v-model="description"
                :maxlength="500"
              />
            </FloatLabel>
            <span class="char-counter">{{ description?.length ?? 0 }}/500</span>
            <Message
              v-if="errors.description"
              severity="error"
              variant="simple"
              size="small"
            >
              {{ errors.description }}
            </Message>
          </div>

          <Button
            :label="buttons.SUBMIT_FEEDBACK"
            class="w-100"
            severity="primary"
            @click="submitFeedback"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .feedback-success-buttons {
    flex-direction: column;
    width: 100%;
  }
}
</style>
