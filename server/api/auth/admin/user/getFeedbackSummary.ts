export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    const { totalOpenFeedbacks, totalInProgressFeedbacks, totalFeedbacks } =
      await auth.getFeedbackSummary(event);

    return {
      success: true,
      totalOpenFeedbacks,
      totalInProgressFeedbacks,
      totalFeedbacks,
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
