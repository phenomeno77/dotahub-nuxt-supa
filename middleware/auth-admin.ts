import { UserRole } from "@prisma/client";

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();

  console.log(user);

  if (
    to.path === "/admin-dashboard" &&
    (!user.value || user.value.user_metadata.role !== UserRole.admin)
  ) {
    return navigateTo("/");
  }
});
