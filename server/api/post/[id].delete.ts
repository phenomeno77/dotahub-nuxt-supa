import postUtils from "~/server/utils/postUtils";

export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

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

    await postUtils.deletePost(event, postId);

    return {
      success: true,
    };
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode,
      statusMessage: err.statusMessage,
    });
  }
});
