import { H3Event } from "h3";
import prisma from "~/lib/prisma";
import { UserStatus, Rank, UserRole, Position } from "@prisma/client";
import { ErrorMessages } from "../constants/errors";
import { checkAndUpdatePremiumStatus } from "./premiumCheck";
import { RATE_LIMITS } from "../constants/rateLimits";

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

  // Check premium status
  await checkAndUpdatePremiumStatus(user);

  const now = new Date();
  const resetTime = user.lastPostReset ?? new Date(0);
  const oneDay = 24 * 60 * 60 * 1000;

  let postsToday = user.postsToday;
  let commentsToday = user.commentsToday;

  if (now.getTime() - resetTime.getTime() > oneDay) {
    postsToday = 0;
    commentsToday = 0;
  }

  const maxPosts = user.isPremium
    ? RATE_LIMITS.POSTS_PER_DAY.PREMIUM
    : RATE_LIMITS.POSTS_PER_DAY.FREE;

  if (postsToday >= maxPosts) {
    throw createError({
      statusCode: 429,
      statusMessage: ErrorMessages.DAILY_POST_LIMIT_REACHED,
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

  // Update user counts
  await prisma.userProfile.update({
    where: { id: user.id },
    data: {
      postsToday: postsToday + 1,
      commentsToday,
      lastPostReset: postsToday === 0 ? now : user.lastPostReset,
    },
  });
}

async function getPosts(event: H3Event, limit: number, skip: number) {
  const { user: currentUser } = await getUserSession(event);

  if (!currentUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  // Fetch posts from premium and free users
  const [premiumPosts, freePosts] = await Promise.all([
    prisma.posts.findMany({
      where: { user: { isPremium: true } },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.posts.findMany({
      where: { user: { isPremium: false } },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
  ]);

  // Merge: 2 premium : 1 free
  const merged: typeof premiumPosts = [];
  let p = 0,
    f = 0;
  while (p < premiumPosts.length || f < freePosts.length) {
    for (let i = 0; i < 2 && p < premiumPosts.length; i++) {
      merged.push(premiumPosts[p++]);
    }
    if (f < freePosts.length) {
      merged.push(freePosts[f++]);
    }
  }

  const paginated = merged.slice(skip, skip + limit);

  // Get comment counts with groupBy
  const postIds = paginated.map((post) => post.id);

  const commentCounts = await prisma.postComments.groupBy({
    by: ["postId"],
    where: {
      postId: { in: postIds },
    },
    _count: {
      postId: true,
    },
  });

  // Convert counts to a map for quick lookup
  const countMap = new Map(
    commentCounts.map((item) => [item.postId, item._count.postId])
  );

  const formattedPosts = paginated.map((post) => ({
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
      isPremium: post.user.isPremium,
    },
    commentCount: countMap.get(post.id) ?? 0,
  }));

  return {
    posts: formattedPosts,
    total: premiumPosts.length + freePosts.length,
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

export default {
  createPost,
  getPosts,
  updatePost,
  deletePost,
};
