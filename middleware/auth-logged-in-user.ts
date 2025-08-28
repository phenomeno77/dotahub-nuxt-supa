export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    throw createError({
      statusCode: 404,
    });
  }
});
