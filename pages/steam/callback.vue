<script setup lang="ts">
import { useRouter } from "vue-router";
import { onMounted } from "vue";
import { UserRole } from "~/types/enums";

const authStore = useAuthStore();
const router = useRouter();

function isValidUserRole(value: any): value is UserRole {
  return Object.values(UserRole).includes(value);
}

onMounted(async () => {
  try {
    const res = await $fetch("/api/auth/me");
    if (res?.user) {
      const {
        userId,
        userRole,
        username,
        avatarUrl,
        isPremium,
        premiumExpiresAt,
      } = res.user;

      if (!isValidUserRole(userRole)) {
        throw new Error("Invalid user role");
      }

      authStore.login(
        userRole,
        username,
        avatarUrl,
        isPremium,
        userId,
        premiumExpiresAt
      );
      router.replace("/");
    } else {
      router.replace("/login?error=session_not_found");
    }
  } catch (err) {
    console.error("Error loading user session:", err);
    router.replace("/error=auth_failed");
  }
});
</script>

<template>
  <div
    class="d-flex align-items-center justify-content-center text-center py-10"
  >
    Logging in...
  </div>
</template>
