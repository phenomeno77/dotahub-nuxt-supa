import { UserRole } from "~/types/enums";

export default defineNuxtRouteMiddleware(() => {
  const { user, loggedIn } = useUserSession();

  if (!loggedIn.value || user.value.role !== UserRole.admin) {
    throw createError({
      statusCode: 404,
    });
  }
});
