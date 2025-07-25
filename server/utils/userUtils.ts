import { H3Event } from "h3";
import prisma from "~/lib/prisma";
import { ErrorMessages } from "../constants/labels";

async function getUserById(event: H3Event, userId: string) {
  const { user: currentUser } = await getUserSession(event);

  if (!currentUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const user = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      avatarUrl: true,
      username: true,
    },
  });

  return user;
}

export default {
  getUserById,
};
