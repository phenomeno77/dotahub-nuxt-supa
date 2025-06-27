export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const limit = Math.min(parseInt(query.limit as string) || 5, 50); // enforce max limit
    const skip = Math.max(parseInt(query.skip as string) || 0, 0); // avoid negative skip

    const { items, total } = await postUtils.getPosts(event, limit, skip);

    return {
      success: true,
      items,
      total,
    };
  } catch (err: any) {
    console.error("Post fetch failed:", err); // Optional server-side logging

    return sendError(
      event,
      createError({
        statusCode: err.statusCode || 500,
        statusMessage:
          err.statusMessage || "Something went wrong while fetching posts.",
      })
    );
  }
});
