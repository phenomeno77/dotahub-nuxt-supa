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
    class="absolute inset-x-0 top-20 bottom-10 flex justify-center items-center px-4 overflow-auto"
  >
    <Card
      :pt="{
        root: {
          style: {
            background: 'var(--bg-post)',
            color: 'var(--text-color)',
            border: 'none',
            width: '100%',
            maxWidth: '800px',
            minWidth: '300px',
          },
        },
      }"
    >
      <!-- Title -->
      <template #title>
        <h4 class="text-center mb-1">
          {{ submitted ? labels.THANK_YOU_TITLE : labels.SEND_FEEDBACK }}
        </h4>
        <p class="text-center text-sm">
          {{ submitted ? labels.THANK_YOU_TEXT : labels.FEEDBACK_TEXT }}
        </p>
      </template>

      <!-- Content -->
      <template #content>
        <!-- Thank You View -->
        <div
          v-if="submitted"
          class="flex flex-col items-center gap-3 p-3 text-center"
        >
          <i
            class="pi pi-check-circle !text-[2rem] text-[var(--rank-text)]"
          ></i>

          <div
            class="flex justify-center gap-3 mt-3 flex-col sm:flex-row w-full feedback-success-buttons"
          >
            <Button
              :label="buttons.SUBMIT_ANOTHER_FEEDBACK"
              outlined
              severity="secondary"
              class="w-full sm:w-auto"
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
              class="w-full sm:w-auto"
              @click="() => navigateTo('/')"
            />
          </div>
        </div>

        <!-- Feedback Form -->
        <div v-else class="flex flex-col gap-4">
          <!-- Feedback Type -->
          <div>
            <label for="feedback-type" class="form-label font-bold">{{
              labels.FEEDBACK_TYPE
            }}</label>
            <Select
              id="feedback-type"
              v-model="type"
              class="w-full"
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
          <div class="relative">
            <FloatLabel variant="on">
              <label for="description">{{ labels.DESCRIPTION }}</label>
              <Textarea
                id="description"
                v-model="description"
                autoResize
                rows="6"
                class="w-full"
                :maxlength="500"
              />
            </FloatLabel>
            <div class="flex justify-end text-sm mt-1">
              <span class="char-counter"
                >{{ description?.length ?? 0 }}/500</span
              >
            </div>
            <Message
              v-if="errors.description"
              severity="error"
              variant="simple"
              size="small"
            >
              {{ errors.description }}
            </Message>
          </div>

          <!-- Submit Button -->
          <Button
            :label="buttons.SUBMIT_FEEDBACK"
            severity="primary"
            class="w-full"
            @click="submitFeedback"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
/* Stack success buttons vertically on mobile */
@media (max-width: 640px) {
  .feedback-success-buttons {
    flex-direction: column;
  }
}
</style>
