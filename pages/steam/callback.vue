<script setup lang="ts">
import { onMounted } from "vue";
import { UserRole } from "~/types/enums";
import { ErrorMessages } from "~/server/constants/errors";

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

      //TODO: verify status from auth store

      if (!isValidUserRole(user.role)) {
        throw createError({
          statusCode: 401,
          statusMessage: ErrorMessages.INVALID_ROLE,
        });
      }

      authStore.login(
        user.role,
        user.username,
        user.avatarUrl,
        user.isPremium,
        user.id,
        user.premiumExpiresAt
      );
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
  <div
    class="d-flex align-items-center justify-content-center text-center py-10"
  >
    Logging in...
  </div>
</template>
