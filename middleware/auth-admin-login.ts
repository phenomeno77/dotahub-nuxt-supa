// middleware/auth-admin-login.ts
export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    return;
  }

  // Fetch the full user (from your DB)
  const currentUser = await useCurrentUser();

  if (currentUser?.role === "admin") {
    // Logged-in and has admin role — redirect to dashboard
    return navigateTo("/admin-dashboard");
  }

  // Logged-in but not admin — redirect somewhere else or show an error
  return navigateTo("/"); // Or a 403 page
});
