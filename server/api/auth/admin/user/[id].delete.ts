import postUtils from "~/server/utils/postUtils";

export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    const params = event.context.params;
    if (!params?.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing User ID.",
      });
    }

    const userId = params.id;

    const success = await auth.deleteUser(event, userId);

    return {
      success,
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
