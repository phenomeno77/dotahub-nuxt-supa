import { UserRole } from "~/types/enums";

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();

  if (authStore.userRole !== UserRole.admin) {
    return navigateTo("/");
  }
});
