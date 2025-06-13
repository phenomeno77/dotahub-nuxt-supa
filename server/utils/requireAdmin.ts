import prisma from "~/lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import { ErrorMessages } from "~/server/constants/errors";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const userId = (session.user as { id: string }).id;

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const user = await prisma.user_profile.findUnique({
    where: { id: userId },
  });

  if (
    !user ||
    user.role !== UserRole.admin ||
    user.userStatus !== UserStatus.active
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.NO_PERMISSION,
    });
  }

  return user;
});
