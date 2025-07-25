export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing Post ID in URL.",
      });
    }

    const post = await postUtils.getPostById(event, Number(id));

    return {
      success: true,
      post,
    };
  } catch (err: any) {
    console.error("Post fetch failed:", err); // Optional server-side logging

    return sendError(
      event,
      createError({
        statusCode: err.statusCode || 500,
        statusMessage:
          err.statusMessage || "Something went wrong while fetching post.",
      })
    );
  }
});
