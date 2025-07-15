import { H3Event } from "h3";
import prisma from "~/lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";
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
        },
      },
    },
  });

  return newComment;
}
export async function getCommentsForPost(
  event: H3Event,
  postId: number,
  limit: number,
  skip: number
) {
  // Get total number of comments for this post
  const total = await prisma.postComments.count({
    where: {
      postId: Number(postId),
    },
  });

  // Fetch paginated comments, ordered by newest first
  const comments = await prisma.postComments.findMany({
    where: {
      postId: Number(postId),
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Format result if needed (optional: here it's already clean)
  const formatted = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    user: comment.user,
  }));

  return {
    items: formatted,
    total,
  };
}

async function deleteComment(event: H3Event, commentId: number) {
  const { user: currentUser } = await getUserSession(event);

  if (!currentUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const user = await prisma.userProfile.findUnique({
    where: { id: currentUser.id },
  });

  if (!user || user.userStatus !== UserStatus.active) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const comment = await prisma.postComments.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw createError({
      statusCode: 404,
      statusMessage: "Comment not found",
    });
  }

  // Only the comment's author or an admin can delete
  if (comment.userId !== user.id && user.role !== UserRole.admin) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  await prisma.postComments.delete({
    where: { id: commentId },
  });

  return comment;
}

export default {
  addComment,
  getCommentsForPost,
  deleteComment,
};
