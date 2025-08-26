<script setup lang="ts">
import { onMounted } from "vue";
import { ErrorMessages } from "~/server/constants/labels";
import { UserRole } from "~/types/enums";

const authStore = useAuthStore();

function isValidUserRole(value: any): value is UserRole {
  return Object.values(UserRole).includes(value);
}

onMounted(async () => {
  try {
    const res = await $fetch("/api/auth/me");
    if (res?.user) {
      const currentUser = res;

      if (!currentUser) {
        throw createError({
          statusCode: 401,
          statusMessage: ErrorMessages.UNAUTHORIZED,
        });
      }

      const { user, latestBan } = currentUser;

      if (!isValidUserRole(user.role)) {
        throw createError({
          statusCode: 401,
          statusMessage: ErrorMessages.INVALID_ROLE,
        });
      }

      authStore.login(user.username, user.avatarUrl);
      navigateTo("/");
    } else {
      navigateTo("/login?error=session_not_found");
    }
  } catch (err: any) {
    if (err.statusCode === 403 && err.data?.reason) {
      console.warn("User is banned:", err.data.reason);

      const query = new URLSearchParams({
        error: "account_banned",
        banReason: encodeURIComponent(err.data.reason),
      });

      if (err.data.banExpiration) {
        query.set("banExpiration", encodeURIComponent(err.data.banExpiration));
      }

      return navigateTo(`/?${query.toString()}`);
    }

    console.error("Error loading user session:", err);
    navigateTo("/?error=auth_failed");
  }
});
</script>

<template>
  <div class="flex items-center justify-center text-center py-10 w-full h-full">
    Logging in...
  </div>
</template>
