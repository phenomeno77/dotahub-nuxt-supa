import { sendError, createError } from "h3";

export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);
    const body = await readBody(event);

    await postUtils.createPost(event, body.post);

    return {
      success: true,
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
