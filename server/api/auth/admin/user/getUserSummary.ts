export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    const { totalUsersOnline, totalUsersCount } = await auth.getUserSummary(
      event
    );

    return {
      success: true,
      totalUsersOnline,
      totalUsersCount,
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
