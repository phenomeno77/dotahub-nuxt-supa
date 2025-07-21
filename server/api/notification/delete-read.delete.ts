// /api/notifications/[id]/mark-read.ts
export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    await notificationUtils.deleteRead(event);

    return {
      success: true,
    };
  } catch (err: any) {
    console.error("Notifications fetch failed:", err);

    return sendError(
      event,
      createError({
        statusCode: err.statusCode || 500,
        statusMessage:
          err.statusMessage ||
          "Something went wrong while fetching notifications.",
      })
    );
  }
});
