export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    const feedbacks = await userFeedbackUtils.getFeedbacks(event);

    return feedbacks;
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
