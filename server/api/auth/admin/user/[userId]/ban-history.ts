export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    const userId = event.context.params?.userId;

    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: "Missing userId" });
    }

    const banHistories = await auth.getBanHistories(event, userId);

    return banHistories;
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
