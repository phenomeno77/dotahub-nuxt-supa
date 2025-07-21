<script setup lang="ts">
import { errorMessage, labels, buttons } from "~/constants/labels";

const emits = defineEmits(["submit-ban"]);
const showBanUserDialog = defineModel<boolean>("showBanUserDialog");
const errors = ref<Record<string, string>>({});
const banReason = ref<string>("");
const banDuration = ref<string | null>(null);
const durations = [
  { label: "1 Hour", value: "1h" },
  { label: "6 Hours", value: "6h" },
  { label: "12 Hours", value: "12h" },
  { label: "1 Day", value: "1d" },
  { label: "3 Days", value: "3d" },
  { label: "1 Week", value: "1w" },
  { label: "Permanent", value: "perm" },
];

const validateForm = () => {
  errors.value = {};

  if (!banReason.value.trim()) {
    errors.value.banReason = errorMessage.BAN_REASON_REQUIRED;
  }
  if (!banDuration.value) {
    errors.value.banDuration = "Ban duration is required";
  }

  return Object.keys(errors.value).length === 0;
};

const submitForm = () => {
  if (!validateForm()) return;

  const banData = {
    banReason: banReason.value.trim(),
    banDuration: banDuration.value,
  };

  emits("submit-ban", banData);

  // ✅ Reset form after submission to avoid stale data
  banReason.value = "";
  banDuration.value = "";
};
</script>

<template>
  <Dialog
    v-model:visible="showBanUserDialog"
    modal
    position="center"
    :draggable="false"
    :header="labels.BAN_FORM"
    :style="{ width: '40%' }"
    :breakpoints="{ '960px': '90vw', '640px': '90vw' }"
    :contentStyle="{ height: '100%' }"
  >
    <div class="mb-3 w-100 d-flex flex-column p-2">
      <FloatLabel variant="on">
        <label for="banReason">{{ labels.BAN_REASON }}</label>
        <InputText id="banReason" class="w-100" v-model="banReason" required />
      </FloatLabel>
      <Message
        v-if="errors.banReason"
        severity="error"
        variant="simple"
        size="small"
      >
        {{ errors.banReason }}
      </Message>
    </div>

    <div class="mb-3 w-100 d-flex flex-column p-2">
      <Select
        id="banDuration"
        class="w-100"
        v-model="banDuration"
        :options="durations"
        optionLabel="label"
        optionValue="value"
        placeholder="Select Duration"
      />
      <Message
        v-if="errors.banDuration"
        severity="error"
        variant="simple"
        size="small"
      >
        {{ errors.banDuration }}
      </Message>
    </div>

    <div class="w-100 text-center">
      <Button
        :label="buttons.SUBMIT_BAN"
        icon="pi pi-ban"
        class="w-100"
        @click="submitForm"
      />
    </div>
  </Dialog>
</template>

<style></style>
