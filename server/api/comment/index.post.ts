import { sendError, createError } from "h3";
import commentUtils from "~/server/utils/commentUtils";

export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);
    const body = await readBody(event);

    const newComment = await commentUtils.addComment(
      event,
      body.comment,
      body.postId
    );

    return {
      success: true,
      data: newComment,
    };
  } catch (err: any) {
    return sendError(
      event,
      createError({
        statusCode: err.statusCode || 500,
        statusMessage: err.statusMessage || "Unknown error",
      })
    );
  }
});
