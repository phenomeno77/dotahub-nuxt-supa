<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import validator from "validator";
import notifications from "@/utils/notifications";
import { errorMessage, labels, buttons } from "@/constants/labels";
import { useAuthStore } from "~/stores/auth";
import { UserRole } from "~/types/enums";

const emit = defineEmits(["success"]);
const toast = useToast();
const email = ref("");
const password = ref("");
const errors = ref<Record<string, string>>({});
const authStore = useAuthStore();
const loading = useLoadingStore();

function isValidUserRole(value: any): value is UserRole {
  return Object.values(UserRole).includes(value);
}

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

const submitForm = async () => {
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

  try {
    loading.startLoading();
    const lowercasedEmail = email.value.toLowerCase();

    const { success, user } = await $fetch("/api/auth/admin/user/login", {
      method: "POST",
      body: {
        email: lowercasedEmail,
        password: password.value,
      },
    });

    const { fetch } = useUserSession();
    await fetch();

    if (!isValidUserRole(user.role)) {
      throw new Error("Invalid user role");
    }

    authStore.login(user.username, user.avatarUrl);

    emit("success");
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(toast, "warn", "Login failed", message, 10000);
  } finally {
    loading.stopLoading();
  }
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
            @keyup.enter="submitForm"
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
            @keyup.enter="submitForm"
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
