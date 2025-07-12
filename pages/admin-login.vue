<script setup lang="ts">
import AdminLoginForm from "~/components/admin/AdminLoginForm.vue";

definePageMeta({ middleware: "auth-admin-login" });

const handleLoginSuccess = () => {
  navigateTo("/admin-dashboard");
};
</script>

<template>
  <div class="container d-flex justify-content-center align-items-center h-100">
    <div class="admin-form-wrapper card p-4">
      <AdminLoginForm @success="handleLoginSuccess" />
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
