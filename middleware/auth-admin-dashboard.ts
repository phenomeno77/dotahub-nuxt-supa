import { UserRole } from "@prisma/client";

export default defineNuxtRouteMiddleware(async () => {
  const user = await useCurrentUser();

  if (!user || user.role !== UserRole.admin) {
    return navigateTo("/");
  }
});
