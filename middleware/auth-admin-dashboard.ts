export default defineNuxtRouteMiddleware(async () => {
  const user = await useCurrentUser();

  if (!user || user.role !== "admin") {
    return navigateTo("/");
  }
});
