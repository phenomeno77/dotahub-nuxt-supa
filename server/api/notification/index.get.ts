import notificationUtils from "~/server/utils/notificationUtils";

export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    const notifications = await notificationUtils.getNotifications(event);

    return {
      success: true,
      notifications,
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
