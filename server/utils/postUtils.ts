import { H3Event } from "h3";
import prisma from "~/lib/prisma";
import { UserStatus, Rank, UserRole, Position } from "@prisma/client";
import { ErrorMessages, fixed_values } from "../constants/labels";

async function createPost(
  event: H3Event,
  postData: {
    partySize?: number;
    positionsNeeded?: Position[];
    minRank: Rank;
    maxRank: Rank;
    description?: string;
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

  // Input validation
  const {
    partySize = 1,
    positionsNeeded = [],
    minRank,
    maxRank,
    description = "",
  } = postData;

  if (description.length > fixed_values.POST_MAX_TEXT_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.POST_DESCRIPTION_LONG,
    });
  }

  if (!minRank || !maxRank) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.MIN_RANK_MAX_RANK_REQUIRED,
    });
  }

  const rankOrder = Object.values(Rank);
  const minIndex = rankOrder.indexOf(minRank);
  const maxIndex = rankOrder.indexOf(maxRank);

  if (minIndex === -1 || maxIndex === -1) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.INVALID_RANK,
    });
  }

  if (minIndex > maxIndex) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.MIN_RANK_LESS_THAN_MAX_RANK,
    });
  }

  if (partySize < 1 || partySize > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.PARTY_SIZE_ERROR,
    });
  }

  // Save post
  await prisma.posts.create({
    data: {
      partySize,
      positionsNeeded: positionsNeeded,
      minRank,
      maxRank,
      description,
      userId: user.id,
    },
  });
}

async function getPosts(event: H3Event, limit: number, skip: number) {
  // Fetch posts ordered by createdAt desc (with pagination)
  const posts = await prisma.posts.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
    skip,
    take: limit,
  });

  // Total count for pagination
  const total = await prisma.posts.count();

  // Get comment counts
  const postIds = posts.map((post) => post.id);

  const commentCounts = await prisma.postComments.groupBy({
    by: ["postId"],
    where: {
      postId: { in: postIds },
    },
    _count: {
      postId: true,
    },
  });

  const countMap = new Map(
    commentCounts.map((item) => [item.postId, item._count.postId])
  );

  // Format posts for response
  const formattedPosts = posts.map((post) => ({
    id: post.id,
    userId: post.user.id,
    partySize: post.partySize,
    positionsNeeded: post.positionsNeeded,
    minRank: post.minRank,
    maxRank: post.maxRank,
    description: post.description,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    user: post.user,
    commentCount: countMap.get(post.id) ?? 0,
  }));

  return {
    items: formattedPosts,
    total,
  };
}

async function getUsersPostHistory(
  event: H3Event,
  userId: string,
  limit: number,
  skip: number
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

  // Count total posts for the user
  const total = await prisma.posts.count({
    where: {
      userId,
    },
  });

  // Paginated posts for the user
  const posts = await prisma.posts.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
    skip,
    take: limit,
  });

  const postIds = posts.map((post) => post.id);

  const commentCounts = await prisma.postComments.groupBy({
    by: ["postId"],
    where: {
      postId: { in: postIds },
    },
    _count: {
      postId: true,
    },
  });

  const countMap = new Map(
    commentCounts.map((item) => [item.postId, item._count.postId])
  );

  const formattedPosts = posts.map((post) => ({
    id: post.id,
    userId: post.user.id,
    partySize: post.partySize,
    positionsNeeded: post.positionsNeeded,
    minRank: post.minRank,
    maxRank: post.maxRank,
    description: post.description,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    user: {
      id: post.user.id,
      username: post.user.username,
      avatarUrl: post.user.avatarUrl,
    },
    commentCount: countMap.get(post.id) ?? 0,
  }));

  return {
    items: formattedPosts,
    total,
  };
}

async function updatePost(
  event: H3Event,
  postData: {
    partySize?: number;
    positionsNeeded?: Position[];
    minRank: Rank;
    maxRank: Rank;
    description?: string;
  },
  postId: number
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

  const post = await prisma.posts.findUnique({ where: { id: postId } });

  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: ErrorMessages.POST_NOT_FOUND,
    });
  }

  if (post.userId !== user.id && user.role !== UserRole.admin) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const {
    minRank,
    maxRank,
    partySize,
    positionsNeeded,
    description = "",
  } = postData;

  if (description.length > fixed_values.POST_MAX_TEXT_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.POST_DESCRIPTION_LONG,
    });
  }

  if (!minRank || !maxRank) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.MIN_RANK_MAX_RANK_REQUIRED,
    });
  }

  const rankOrder = Object.values(Rank);
  const minIndex = rankOrder.indexOf(minRank);
  const maxIndex = rankOrder.indexOf(maxRank);

  if (minIndex === -1 || maxIndex === -1) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.INVALID_RANK,
    });
  }

  if (minIndex > maxIndex) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.MIN_RANK_LESS_THAN_MAX_RANK,
    });
  }

  if (!positionsNeeded || positionsNeeded.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.NO_POSITION_SELECTED,
    });
  }

  if (!partySize || partySize < 1 || partySize > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.PARTY_SIZE_ERROR,
    });
  }

  const updatedPost = await prisma.posts.update({
    where: { id: postId },
    data: {
      partySize,
      positionsNeeded: positionsNeeded,
      minRank,
      maxRank,
      description,
    },
  });

  return updatedPost;
}

async function deletePost(event: H3Event, postId: number) {
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

  const post = await prisma.posts.findUnique({ where: { id: postId } });

  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: ErrorMessages.POST_NOT_FOUND,
    });
  }

  if (post.userId !== user.id && user.role !== UserRole.admin) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  await prisma.posts.delete({ where: { id: postId } });

  return post;
}

async function getPostById(event: H3Event, postId: number) {
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

  const post = await prisma.posts.findUnique({
    where: { id: postId },
    include: {
      user: true,
    },
  });

  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: ErrorMessages.POST_NOT_FOUND,
    });
  }

  return post;
}

export default {
  createPost,
  getPosts,
  getUsersPostHistory,
  updatePost,
  deletePost,
  getPostById,
};
