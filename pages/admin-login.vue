<script setup lang="ts">
import AdminLoginForm from "~/components/admin/AdminLoginForm.vue";
import notifications from "@/utils/notifications";
import { errorMessage } from "~/constants/labels";
import validator from "validator";
import { useAuthStore } from "~/stores/auth";
import { UserRole } from "~/types/enums";

definePageMeta({
  middleware: "auth-admin-login",
});

const toast = useToast();
const errors = ref<Record<string, string>>({});
const loading = useLoadingStore();
const authStore = useAuthStore();

const validateForm = (email: string, password: string) => {
  errors.value = {};
  if (!password.trim() || !email.trim()) {
    errors.value.email = errorMessage.USERNAME_PASSWORD_REQUIRED;
  }

  if (!validator.isEmail(email)) {
    errors.value.email = errorMessage.VALID_EMAIL;
  }

  return Object.keys(errors.value).length === 0;
};

function isValidUserRole(value: any): value is UserRole {
  return Object.values(UserRole).includes(value);
}

const handleLogin = async (loginData: { email: string; password: string }) => {
  loading.startLoading();

  if (!validateForm(loginData.email, loginData.password)) {
    notifications(
      toast,
      "warn",
      "Login failed",
      errors.value.email || errors.value.password,
      3000
    );
    loading.stopLoading();
    return;
  }

  try {
    const { success, user } = await $fetch("/api/auth/admin/login", {
      method: "POST",
      body: loginData,
    });

    const { fetch } = useUserSession();
    await fetch();

    if (!isValidUserRole(user.role)) {
      throw new Error("Invalid user role");
    }

    authStore.login(
      user.role,
      user.username,
      user.avatarUrl,
      user.isPremium,
      user.id,
      user.premiumExpiresAt
    );

    navigateTo("/admin-dashboard");
  } catch (error: any) {
    const message =
      error?.response?._data?.statusMessage ||
      error.statusMessage ||
      error.message ||
      "Unexpected error";

    notifications(toast, "warn", "Login failed", message, 10000);
  } finally {
    setTimeout(() => {
      loading.stopLoading();
    }, 700);
  }
};
</script>
<template>
  <div
    class="container d-flex flex-column justify-content-center align-items-center h-100"
  >
    <div class="admin-form-wrapper card p-4">
      <AdminLoginForm @submit="handleLogin" />
    </div>
  </div>
</template>

<style scoped>
.admin-form-wrapper {
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 2rem;
  border-radius: none;
  width: 60%;
}

@media (max-width: 768px) {
  .admin-form-wrapper {
    width: 90%;
  }
}
</style>
