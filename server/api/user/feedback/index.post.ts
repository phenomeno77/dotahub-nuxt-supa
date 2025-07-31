import { sendError, createError } from "h3";

export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);
    const body = await readBody(event);

    await userFeedbackUtils.sendFeedback(event, body.feedback);

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
