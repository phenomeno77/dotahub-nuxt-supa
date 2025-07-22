import { H3Event } from "h3";
import prisma from "~/lib/prisma";
import { ErrorMessages } from "../constants/errors";

async function getNotifications(event: H3Event) {
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications;
}

async function markAsRead(event: H3Event, id: number) {
  const { user: currentUser } = await getUserSession(event);

  if (!currentUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  await prisma.notifications.update({
    where: { id },
    data: { isRead: true },
  });
}

async function deleteRead(event: H3Event) {
  const { user: currentUser } = await getUserSession(event);

  if (!currentUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  await prisma.notifications.deleteMany({
    where: {
      userId: currentUser.id,
      isRead: true,
    },
  });
}

async function markAllAsRead(event: H3Event) {
  const { user: currentUser } = await getUserSession(event);

  if (!currentUser) {
    throw createError({
      statusCode: 403,
      statusMessage: "Unauthorized",
    });
  }

  await prisma.notifications.updateMany({
    where: {
      userId: currentUser.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

export default {
  getNotifications,
  markAsRead,
  deleteRead,
  markAllAsRead,
};
