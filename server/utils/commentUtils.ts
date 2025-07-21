import { H3Event } from "h3";
import prisma from "~/lib/prisma";
import { NotificationType, UserRole, UserStatus } from "@prisma/client";
import { ErrorMessages, fixed_values } from "../constants/errors";

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

  if (comment.length > fixed_values.COMMENT_MAX_TEXT_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.COMMENT_CONTENT_LONG,
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

  //Create notification if the commenter is NOT the post author
  if (post.userId !== currentUser.id) {
    await prisma.notifications.create({
      data: {
        userId: post.userId,
        postId: post.id,
        commentId: newComment.id,
        type: NotificationType.comment_on_post,
        message: "",
      },
    });
  }

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
    include: { post: true }, // ✅ include post info
  });

  if (!comment) {
    throw createError({
      statusCode: 404,
      statusMessage: "Comment not found",
    });
  }

  // ✅ Allow deletion if:
  // - user is comment author
  // - user is post owner
  // - user is admin
  const isCommentAuthor = comment.userId === user.id;
  const isPostOwner = comment.post.userId === user.id;
  const isAdmin = user.role === UserRole.admin;

  if (!isCommentAuthor && !isPostOwner && !isAdmin) {
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

async function updateComment(
  event: H3Event,
  newContent: string,
  commentId: number
) {
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
      statusMessage: ErrorMessages.POST_NOT_FOUND,
    });
  }

  if (comment.userId !== user.id && user.role !== UserRole.admin) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  if (newContent.length > fixed_values.COMMENT_MAX_TEXT_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.COMMENT_CONTENT_LONG,
    });
  }

  const updatedComment = await prisma.postComments.update({
    where: { id: commentId },
    data: {
      content: newContent,
    },
  });

  return updatedComment;
}

export default {
  addComment,
  getCommentsForPost,
  deleteComment,
  updateComment,
};
