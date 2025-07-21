import { H3Event } from "h3";
import prisma from "~/lib/prisma";
import { ErrorMessages } from "../constants/errors";
import { NotificationType } from "@prisma/client";

export async function getNotifications(event: H3Event) {
  const { user: currentUser } = await getUserSession(event);

  if (!currentUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const notifications = await prisma.notifications.findMany({
    where: {
      userId: currentUser.id,
      isRead: false,
    },
    include: {
      post: {
        select: {
          id: true,
          description: true,
          createdAt: true,
        },
      },
      comment: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications;
}

export default {
  getNotifications,
};
