// server/services/postService.ts

import { H3Event } from "h3";
import prisma from "~/lib/prisma";
import { UserStatus, Rank } from "@prisma/client";
import { ErrorMessages } from "../constants/errors";
import { checkAndUpdatePremiumStatus } from "./premiumCheck";
import { RATE_LIMITS } from "../constants/rateLimits";
import { parseAndValidatePositions } from "./validatePositions";

async function createPost(
  event: H3Event,
  postData: {
    partySize?: number;
    positionsNeeded?: string[];
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

  const parsedPositions = parseAndValidatePositions(positionsNeeded);

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
      positionsNeeded: parsedPositions,
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

export default {
  createPost,
};
