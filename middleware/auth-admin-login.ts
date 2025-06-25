import { UserRole } from "~/types/enums";

// middleware/auth-admin-login.ts
export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = useUserSession();
  const authStore = useAuthStore();

  if (!loggedIn.value) {
    return;
  }

  if (authStore.userRole === UserRole.admin) {
    // Logged-in and has admin role — redirect to dashboard
    return navigateTo("/admin-dashboard");
  }

  // Logged-in but not admin — redirect somewhere else or show an error
  return navigateTo("/"); // Or a 403 page
});
