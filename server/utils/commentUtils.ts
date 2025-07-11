import { H3Event } from "h3";
import prisma from "~/lib/prisma";
import { UserStatus } from "@prisma/client";
import { ErrorMessages } from "../constants/errors";

async function addComment(event: H3Event, comment: string, postId: number) {
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

  // Optional: Validate post exists
  const post = await prisma.posts.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: "Post not found",
    });
  }

  // Create the comment
  const newComment = await prisma.postComments.create({
    data: {
      content: comment,
      userId: currentUser.id,
      postId: postId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          isPremium: true,
        },
      },
    },
  });

  return newComment;
}

export default {
  addComment,
};
