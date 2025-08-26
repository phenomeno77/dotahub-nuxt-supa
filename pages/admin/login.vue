<script setup lang="ts">
import AdminLoginForm from "~/components/admin/AdminLoginForm.vue";

definePageMeta({ middleware: "auth-admin-login" });

const handleLoginSuccess = () => {
  navigateTo("/admin");
};
</script>
<template>
  <div class="flex items-center justify-center min-h-screen">
    <div
      class="w-full max-w-2xl p-8 rounded-xl shadow-lg flex flex-col items-center"
    >
      <!-- Login Form -->
      <AdminLoginForm @success="handleLoginSuccess" />
    </div>
  </div>
</template>
