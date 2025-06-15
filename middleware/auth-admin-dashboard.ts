import { UserRole } from "@prisma/client";

export default defineNuxtRouteMiddleware(async () => {
  const user = await useCurrentUser();

  const authStore = useAuthStore();

  if (authStore.userRole !== UserRole.admin) {
    return navigateTo("/");
  }
});
