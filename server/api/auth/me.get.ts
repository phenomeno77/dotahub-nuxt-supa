import { ErrorMessages } from "~/server/constants/errors";

export default defineEventHandler(async (event) => {
  await requireUserLoggedIn(event);

  try {
    const user = await auth.currentUser(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessages.LOGIN_REQUIRED,
      });
    }

    return {
      user: {
        userId: user.id,
        userRole: user.role,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
      },
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
