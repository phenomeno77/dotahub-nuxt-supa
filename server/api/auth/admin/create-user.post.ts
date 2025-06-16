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
    console.log("supabase error!!!!!!!", err);

    throw createError({
      statusCode: 401,
      statusMessage: err.statusMessage,
    });
  }
});
