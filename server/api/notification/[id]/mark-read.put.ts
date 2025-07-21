// /api/notifications/[id]/mark-read.ts
export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing notification ID",
      });
    }

    await notificationUtils.markAsRead(event, Number(id));

    return {
      success: true,
    };
  } catch (err: any) {
    console.error("Mark Notification as read failed:", err);

    return sendError(
      event,
      createError({
        statusCode: err.statusCode || 500,
        statusMessage:
          err.statusMessage ||
          "Something went wrong while marking notification as read...",
      })
    );
  }
});
