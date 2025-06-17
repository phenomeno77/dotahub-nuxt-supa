<script setup lang="ts">
import { UserRole } from "@prisma/client";
import validator from "validator";
import notifications from "~/utils/notifications";
import { errorMessage, labels, buttons } from "~/constants/labels";

const emits = defineEmits(["update-table"]);

const showAddUserDialog = defineModel<boolean>("showAddUserDialog");
const username = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const repeatedPassword = ref<string>("");
const errors = ref<Record<string, string>>({});
const passwordErrors = ref<string[]>([]);
const selectedRole = ref<UserRole | null>(UserRole.user);
const roles = Object.values(UserRole);
const toast = useToast();
const loading = useLoadingStore();

const onHideClearUserData = () => {
  username.value = "";
  email.value = "";
  password.value = "";
  repeatedPassword.value = "";
  errors.value = {};
  selectedRole.value = UserRole.user;
};

// Validate password
const validatePassword = () => {
  passwordErrors.value = [];
  if (password.value.length < 8)
    passwordErrors.value.push(errorMessage.PASSWORD_AT_LEAST_8_CHARS);
  if (!/[A-Z]/.test(password.value))
    passwordErrors.value.push(errorMessage.PASSWORD_AT_LEAST_1_UPPERCASE);
  if (!/[0-9]/.test(password.value))
    passwordErrors.value.push(errorMessage.PASSWORD_AT_LEAST_1_NUMBER);
  if (!/[\W_]/.test(password.value))
    passwordErrors.value.push(errorMessage.PASSWORD_AT_LEAST_1_SPECIAL_CHAR);
};

// Validate repeated password
const validateRepeatedPassword = () => {
  return password.value === repeatedPassword.value;
};

// Email Validation
const validateEmail = () => {
  if (!validator.isEmail(email.value)) {
    errors.value.email = errorMessage.VALID_EMAIL;
  } else {
    errors.value.email = "";
  }
};

// Validate entire form
const validateForm = () => {
  errors.value = {};
  if (!username.value.trim())
    errors.value.username = errorMessage.USERNAME_REQUIRED;
  if (!validator.isEmail(email.value))
    errors.value.email = errorMessage.VALID_EMAIL;
  validatePassword();
  if (!selectedRole.value) {
    errors.value.role = errorMessage.ROLE_REQUIRED;
  }

  if (!validateRepeatedPassword()) {
    errors.value.repeatedPassword = errorMessage.PASSWORD_NOT_MATCH;
  }

  return Object.keys(errors.value).length === 0;
};

// Emit form data when submitted
const submitForm = async () => {
  if (
    !selectedRole.value ||
    !Object.values(UserRole).includes(selectedRole.value)
  ) {
    throw new Error("Invalid role selected");
  }

  if (!validateForm()) return;

  try {
    loading.startLoading();

    const response = await $fetch("/api/auth/admin/create-user", {
      method: "POST",
      body: {
        username: username.value.trim(),
        email: email.value,
        password: password.value,
        role: selectedRole.value as UserRole,
      },
    });
    if (response.success) {
      notifications(toast, "success", "User Created Successfully!");
      showAddUserDialog.value = false;
      emits("update-table");
    }
  } catch (error: any) {
    const message = error?.statusMessage;
    notifications(toast, "error", message);
  } finally {
    loading.stopLoading();
  }
};
</script>

<template>
  <Dialog
    v-model:visible="showAddUserDialog"
    modal
    :header="labels.ADD_NEW_USER"
    :style="{ width: '40%' }"
    :breakpoints="{ '960px': '90vw', '640px': '90vw' }"
    :contentStyle="{ height: '100%' }"
    @hide="onHideClearUserData"
  >
    <strong class="p-2">*Email address will be used to login</strong>
    <!-- Email -->
    <div class="mb-3 w-100 d-flex flex-column p-2">
      <FloatLabel variant="on">
        <label for="email">{{ labels.EMAIL }}</label>
        <InputText
          id="email"
          type="email"
          class="w-100"
          v-model="email"
          required
          @input="validateEmail"
        />
      </FloatLabel>
      <Message
        v-if="errors.email"
        severity="error"
        variant="simple"
        size="small"
      >
        {{ errors.email }}
      </Message>
    </div>

    <!-- Roles -->
    <div class="mb-3 w-100 d-flex flex-column p-2">
      <Select
        v-model="selectedRole"
        :options="roles"
        :placeholder="labels.SELECT_ROLE"
      />
      <Message
        v-if="errors.role"
        severity="error"
        variant="simple"
        size="small"
      >
        {{ errors.role }}
      </Message>
    </div>

    <!-- Password -->
    <div class="mb-3 w-100 d-flex flex-column p-2">
      <FloatLabel variant="on">
        <Password
          class="d-flex w-100 flex-column"
          inputId="password"
          v-model="password"
          toggleMask
          :feedback="false"
          @input="validatePassword"
        />
        <label for="password">{{ labels.PASSWORD }}</label>
      </FloatLabel>

      <!-- Show validation errors as a list -->
      <Message
        v-if="passwordErrors.length"
        severity="error"
        variant="simple"
        size="small"
      >
        <ul class="mb-0 ps-3">
          <li v-for="(error, index) in passwordErrors" :key="index">
            {{ error }}
          </li>
        </ul>
      </Message>
    </div>

    <!-- Repeat Password -->
    <div class="mb-3 w-100 d-flex flex-column p-2">
      <FloatLabel variant="on">
        <Password
          class="d-flex w-100 flex-column"
          inputId="repeatedPassword"
          v-model="repeatedPassword"
          toggleMask
          :feedback="false"
          @input="validateRepeatedPassword"
        />
        <label for="repeatedPassword">{{ labels.REPEAT_PASSWORD }}</label>
      </FloatLabel>
      <Message
        v-if="errors.repeatedPassword"
        severity="error"
        variant="simple"
        size="small"
      >
        {{ errors.repeatedPassword }}
      </Message>
    </div>

    <!-- Username -->
    <div class="mb-3 w-100 d-flex flex-column p-2">
      <FloatLabel variant="on">
        <label for="username">{{ labels.USERNAME }}</label>
        <InputText
          id="username"
          type="text"
          class="w-100"
          v-model="username"
          required
        />
      </FloatLabel>
      <Message
        v-if="errors.username"
        severity="error"
        variant="simple"
        size="small"
      >
        {{ errors.username }}
      </Message>
    </div>

    <div class="w-100 text-center">
      <Button
        :label="buttons.ADD_USER"
        icon="pi pi-user"
        class="w-100"
        @click="submitForm"
      />
    </div>
  </Dialog>
</template>

<style scoped></style>
