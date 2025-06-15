<script setup lang="ts">
import AdminLoginForm from "~/components/admin/AdminLoginForm.vue";
import notifications from "@/utils/notifications";
import { errorMessage } from "~/constants/labels";
import validator from "validator";
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  middleware: "auth-admin-login",
});

const toast = useToast();
const errors = ref<Record<string, string>>({});
const loading = useLoading();
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

const handleLogin = async (loginData: { email: string; password: string }) => {
  loading.value = true;

  if (!validateForm(loginData.email, loginData.password)) {
    notifications(
      toast,
      "warn",
      "Login failed",
      errors.value.email || errors.value.password,
      3000
    );
    loading.value = false;
    return;
  }

  try {
    const { user, redirectTo } = await $fetch("/api/auth/admin/login", {
      method: "POST",
      body: loginData,
    });

    const { fetch } = useUserSession();
    await fetch();

    authStore.login(
      user.role,
      user.username,
      user.avatarUrl,
      user.isPremium,
      user.id
    );

    navigateTo(redirectTo);
  } catch (error: any) {
    notifications(toast, "warn", "Login failed", error.statusMessage, 3000);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 700);
  }
};
</script>
<template>
  <div
    class="container d-flex flex-column justify-content-center align-items-center h-100"
  >
    <div class="admin-form-wrapper card p-4 w-75">
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
}
</style>
