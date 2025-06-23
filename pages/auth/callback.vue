<script setup lang="ts">
import { useRouter } from "vue-router";
import { onMounted } from "vue";
import type { UserRole } from "@prisma/client";

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  try {
    const res = await $fetch("/api/auth/me");
    if (res?.user) {
      const { userId, userRole, username, avatarUrl, isPremium } = res.user;
      authStore.login(userRole, username, avatarUrl, isPremium, userId);
      router.replace("/");
    } else {
      router.replace("/login?error=session_not_found");
    }
  } catch (err) {
    console.error("Error loading user session:", err);
    router.replace("/login?error=auth_failed");
  }
});
</script>

<template>
  <div class="text-center py-10">Logging in...</div>
</template>
