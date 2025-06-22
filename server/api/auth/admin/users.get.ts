export default defineEventHandler(async (event) => {
  try {
    console.log("require logged in check..");

    await requireUserLoggedIn(event);

    console.log("fetching users...");

    const users = await auth.getUsers(event);

    console.log("users fetched ok");

    return users;
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode,
      statusMessage: err.statusMessage,
    });
  }
});
