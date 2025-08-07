export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const limit = Math.min(parseInt(query.limit as string) || 5, 50);
    const skip = Math.max(parseInt(query.skip as string) || 0, 0);
    const searchQuery = query.searchQuery?.toString().trim() || "";

    const { items, total } = searchQuery
      ? await postUtils.searchPosts(event, limit, skip, searchQuery) // <-- new function
      : await postUtils.getPosts(event, limit, skip, searchQuery);

    return {
      success: true,
      items,
      total,
    };
  } catch (err: any) {
    console.error("Post fetch failed:", err);

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
