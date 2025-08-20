import { H3Event } from "h3";
import prisma from "~/lib/prisma";
import { ErrorMessages } from "../constants/labels";

async function getUserByPublicId(event: H3Event, publicId: string) {
  const { user: currentUser } = await getUserSession(event);

  if (!currentUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const user = await prisma.userProfile.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      avatarUrl: true,
      username: true,
    },
  });

  return user;
}

export default {
  getUserByPublicId,
};
