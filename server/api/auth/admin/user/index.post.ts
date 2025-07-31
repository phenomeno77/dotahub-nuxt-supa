export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);
    const body = await readBody(event);

    const user = await auth.createNewUser(event, body);

    return {
      success: true,
      user,
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
