import { sendError, createError } from "h3";
import commentUtils from "~/server/utils/commentUtils";

export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    const params = event.context.params;
    if (!params?.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing comment ID in URL.",
      });
    }

    const commentId = Number(params.id);
    if (isNaN(commentId)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Comment ID must be a number.",
      });
    }

    await commentUtils.deleteComment(event, commentId);

    return { success: true };
  } catch (err: any) {
    return sendError(
      event,
      createError({
        statusCode: err.statusCode || 500,
        statusMessage: err.statusMessage || "Failed to delete comment",
      })
    );
  }
});
