export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    const users = await auth.getUsers(event);

    return {
      success: true,
      users,
    };
  } catch (err: any) {
    return sendError(
      event,
      createError({
        statusCode: err.statusCode || 500,
        statusMessage: err.statusMessage || "Something went wrong",
      })
    );
  }
});
