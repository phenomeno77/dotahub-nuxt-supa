<script setup lang="ts">
import { labels, errorMessage, buttons } from "@/constants/labels";
import notifications from "@/utils/notifications";
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import validator from "validator";

const emit = defineEmits(["submit"]);
const toast = useToast();
const email = ref("");
const password = ref("");
const errors = ref<Record<string, string>>({});

const validateForm = () => {
  errors.value = {};

  if (!password.value.trim() || !email.value.trim()) {
    errors.value.email = errorMessage.USERNAME_PASSWORD_REQUIRED;
  }

  if (!validator.isEmail(email.value)) {
    errors.value.email = errorMessage.VALID_EMAIL;
  }

  return Object.keys(errors.value).length === 0;
};

const submitForm = () => {
  if (!validateForm()) {
    notifications(
      toast,
      "warn",
      "Login failed",
      errors.value.email || errors.value.password,
      3000
    );
    return;
  }

  emit("submit", {
    email: email.value,
    password: password.value,
  });
};
</script>

<template>
  <div class="d-flex align-items-center justify-content-center">
    <h1>{{ buttons.SIGN_IN }}</h1>
  </div>

  <div class="row">
    <div
      class="d-flex flex-column align-items-start justify-content-center gap-2"
    >
      <div class="mb-3 w-100 d-flex flex-column">
        <FloatLabel variant="on">
          <label for="email">{{ labels.EMAIL }}</label>
          <InputText
            id="email"
            type="text"
            class="w-100 d-flex flex-column"
            v-model="email"
          />
        </FloatLabel>
      </div>

      <div class="mb-3 w-100 d-flex flex-column">
        <FloatLabel variant="on">
          <Password
            class="w-100 d-flex flex-column"
            inputId="password"
            v-model="password"
            toggleMask
            :feedback="false"
          />
          <label for="password">{{ labels.PASSWORD }}</label>
        </FloatLabel>
      </div>

      <div class="w-100 text-center">
        <Button
          :label="buttons.SIGN_IN"
          icon="pi pi-user"
          class="w-100"
          @click="submitForm"
        ></Button>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
