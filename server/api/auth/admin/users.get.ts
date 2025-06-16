export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);
    const users = await auth.getUsers(event);

    return users;
  } catch (err: any) {
    throw createError({
      statusCode: 401,
      statusMessage: "NOT_AUTHENTICATED",
      message: "Login required",
    });
  }
});
