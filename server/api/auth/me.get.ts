import { ErrorMessages } from "~/server/constants/errors";
import auth from "~/server/utils/auth";
import requireUserLoggedIn from "~/server/utils/requireUserLoggedIn";

export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);
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
    throw createError({
      statusCode: 401,
      statusMessage: ErrorMessages.LOGIN_REQUIRED,
    });
  }
});
