export default defineNuxtRouteMiddleware(async () => {
  const user = await useCurrentUser();

  if (user && user.role === "admin" && user.isLoggedIn) {
    return navigateTo("/admin-dashboard");
  }
});
