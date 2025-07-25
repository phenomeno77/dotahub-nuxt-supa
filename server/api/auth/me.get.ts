import { ErrorMessages } from "~/server/constants/labels";

export default defineEventHandler(async (event) => {
  await requireUserLoggedIn(event);

  try {
    const currentUser = await auth.getCurrentUser(event);

    if (!currentUser) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessages.UNAUTHORIZED,
      });
    }

    const { user, latestBan } = currentUser;

    return {
      user,
      latestBan,
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
