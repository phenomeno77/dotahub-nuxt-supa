import { UserRole } from "~/types/enums";

export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, user } = useUserSession();

  if (!loggedIn.value) {
    return;
  }

  if (user.value.role === UserRole.admin) {
    // Logged-in and has admin role — redirect to dashboard
    return navigateTo("/admin");
  }

  // Logged-in but not admin — redirect somewhere else or show an error
  return navigateTo("/"); // Or a 403 page
});
