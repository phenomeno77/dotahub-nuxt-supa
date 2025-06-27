export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const limit = parseInt(query.limit as string) || 5;
  const skip = parseInt(query.skip as string) || 0;

  try {
    const result = await postUtils.getPosts(event, Number(limit), Number(skip));

    return {
      success: true,
      ...result,
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
