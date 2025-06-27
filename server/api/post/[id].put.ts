import postUtils from "~/server/utils/postUtils";

export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);
    const body = await readBody(event);

    const params = event.context.params;
    if (!params?.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing post ID in URL.",
      });
    }

    const postId = Number(params.id);
    if (isNaN(postId)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Post ID must be a number.",
      });
    }

    await postUtils.updatePost(event, body.post, postId);

    return {
      success: true,
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
