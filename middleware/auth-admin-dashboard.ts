import { UserRole } from "~/types/enums";

export default defineNuxtRouteMiddleware(async () => {
  const { user } = useUserSession();

  if (user.value.role !== UserRole.admin) {
    return navigateTo("/");
  }
});
