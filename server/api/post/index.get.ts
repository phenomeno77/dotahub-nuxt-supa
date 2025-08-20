export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const limit = Math.min(parseInt(query.limit as string) || 5, 50);
    const skip = Math.max(parseInt(query.skip as string) || 0, 0);
    const searchQuery = query.searchQuery?.toString().trim() || "";
    const filterRank = query.rank?.toString().trim() || "";
    let filterPositions: string[] = [];

    if (typeof query.positions === "string") {
      filterPositions = query.positions.split(",").map((s) => s.trim());
    } else if (Array.isArray(query.positions)) {
      filterPositions = query.positions.map((s) => s.toString().trim());
    }

    const { items, total } = await postUtils.filterPosts(
      event,
      limit,
      skip,
      searchQuery || null,
      filterRank || null,
      filterPositions
    );

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
