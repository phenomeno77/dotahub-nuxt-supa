import userUtils from "~/server/utils/userUtils";

export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);

    const publicId = getRouterParam(event, "publicId");

    if (!publicId) {
      throw createError({ statusCode: 400, statusMessage: "Missing user id" });
    }

    const user = await userUtils.getUserByPublicId(event, publicId);

    return {
      success: true,
      user,
    };
  } catch (err: any) {
    console.error("Comment fetch failed:", err);

    return sendError(
      event,
      createError({
        statusCode: err.statusCode || 500,
        statusMessage:
          err.statusMessage || "Something went wrong while fetching comments.",
      })
    );
  }
});
