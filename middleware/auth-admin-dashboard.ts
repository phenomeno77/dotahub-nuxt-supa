import { UserRole } from "@prisma/client";
import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();

  if (authStore.userRole !== UserRole.admin) {
    return navigateTo("/");
  }
});
