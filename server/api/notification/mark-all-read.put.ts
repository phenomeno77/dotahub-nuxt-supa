// /api/notifications/[id]/mark-read.ts
export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    await notificationUtils.markAllAsRead(event);

    return {
      success: true,
    };
  } catch (err: any) {
    console.error("Mark notifications as read failed:", err);

    return sendError(
      event,
      createError({
        statusCode: err.statusCode || 500,
        statusMessage:
          err.statusMessage ||
          "Something went wrong while marking notifications as read.",
      })
    );
  }
});
