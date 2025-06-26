export default defineEventHandler(async (event) => {
  await requireUserLoggedIn(event);

  const query = getQuery(event);
  const limit = parseInt(query.limit as string) || 5;
  const skip = parseInt(query.skip as string) || 0;

  try {
    const result = await postUtills.getPosts(
      event,
      Number(limit),
      Number(skip)
    );

    return {
      success: true,
      ...result,
    };
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode,
      statusMessage: err.statusMessage,
    });
  }
});
