export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    const query = getQuery(event);

    const rawPostId = query.postId;
    if (!rawPostId) {
      throw createError({ statusCode: 400, statusMessage: "Missing postId" });
    }

    const postId = Number(rawPostId);
    if (isNaN(postId)) {
      throw createError({ statusCode: 400, statusMessage: "Invalid postId" });
    }

    const limit = Math.min(parseInt(query.limit as string) || 5, 50);
    const skip = Math.max(parseInt(query.skip as string) || 0, 0);

    const { items, total } = await commentUtils.getCommentsForPost(
      event,
      postId,
      limit,
      skip
    );

    return {
      success: true,
      items,
      total,
    };
  } catch (err: any) {
    console.error("Comment fetch failed:", err);

    return sendError(
      event,
      createError({
        statusCode: err.statusCode || 500,
        statusMessage:
          err.statusMessage || "Something went wrong while fetching comments.",
      })
    );
  }
});
