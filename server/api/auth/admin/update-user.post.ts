export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);
    const body = await readBody(event);

    const user = await auth.updateUser(event, body.newData);

    return {
      success: true,
      user,
    };
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode,
      statusMessage: err.statusMessage,
    });
  }
});
