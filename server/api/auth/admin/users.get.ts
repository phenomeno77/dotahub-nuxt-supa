export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);
    const users = await auth.getUsers(event);

    return users;
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode,
      statusMessage: err.statusMessage,
    });
  }
});
