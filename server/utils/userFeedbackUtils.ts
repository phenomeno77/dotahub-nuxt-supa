import { H3Event } from "h3";
import prisma from "~/lib/prisma";
import { UserStatus, FeedbackType, FeedbackStatus } from "@prisma/client";
import { ErrorMessages, fixed_values } from "../constants/labels";

async function sendFeedback(
  event: H3Event,
  feedbackData: {
    type: FeedbackType;
    message: string;
  }
) {
  const { user: currentUser } = await getUserSession(event);

  if (!currentUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  // Get user from DB
  const user = await prisma.userProfile.findUnique({
    where: { id: currentUser.id },
  });

  if (!user || user.userStatus !== UserStatus.active) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const { type, message } = feedbackData;

  if (message.length < fixed_values.FEEDBACK_MESSAGE_MIN_LENGTH) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.FEEDBACK_DESCRIPTION_AT_LEAST_10_CHAR,
    });
  }

  if (!Object.values(FeedbackType).includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.INVALID_FEEDBACK_TYPE,
    });
  }

  await prisma.userFeedback.create({
    data: {
      message,
      type,
      userId: currentUser.id,
    },
  });
}

async function getFeedbacks(event: H3Event) {
  const isAdminUser = await auth.isAdmin(event);

  if (!isAdminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const feedbacks = await prisma.userFeedback.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      type: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          steamId: true,
        },
      },
    },
  });

  return feedbacks;
}

async function updatefeedback(
  event: H3Event,
  feedbackData: {
    id: number;
    status: FeedbackStatus;
  }
) {
  const isAdminUser = await auth.isAdmin(event);

  if (!isAdminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const feedback = await prisma.userFeedback.findUnique({
    where: { id: feedbackData.id },
  });

  if (!feedback) {
    throw createError({
      statusCode: 401,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const updatedFeedback = await prisma.userFeedback.update({
    where: { id: feedbackData.id },
    data: {
      status: feedbackData.status,
    },
  });

  return updatedFeedback;
}

export default {
  sendFeedback,
  getFeedbacks,
  updatefeedback,
};
