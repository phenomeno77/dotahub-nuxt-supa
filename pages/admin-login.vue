<script setup lang="ts">
import AdminLoginForm from "~/components/admin/AdminLoginForm.vue";
// import { useAdminAuth } from "~/composables/useAdminAuth";

// const { login } = useAdminAuth();

// const handleLogin = async (credentials: {
//   email: string;
//   password: string;
// }) => {
//   await login(credentials.email, credentials.password);
// };
</script>
<template>
  <div
    class="container d-flex flex-column justify-content-center align-items-center h-100"
  >
    <div class="admin-form-wrapper card p-4 w-75">
      <!-- <AdminLoginForm @submit="handleLogin" /> -->
      <AdminLoginForm />
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
