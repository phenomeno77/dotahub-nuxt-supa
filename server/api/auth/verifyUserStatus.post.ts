import { ErrorMessages } from "~/server/constants/labels";

export default defineEventHandler(async (event) => {
  const verifyStatus = await auth.verifyCurrentUserStatus(event);

  if (!verifyStatus) {
    throw createError({
      statusCode: 401,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const { user, latestBan } = verifyStatus;

  if (latestBan) {
    await clearUserSession(event);
    return {
      banned: true,
      banReason: latestBan.reason,
      banExpiration: latestBan.banExpiration || null,
    };
  }

  return { banned: false };
});
