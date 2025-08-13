import {
  FeedbackStatus,
  UserProfile,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { type H3Event } from "h3";
import prisma from "~/lib/prisma";
import { ErrorMessages } from "../constants/labels";
import { getBanExpiration } from "./banUtils";
import crypto from "crypto";

async function setSession(event: H3Event, user: UserProfile) {
  await replaceUserSession(event, {
    user: {
      id: user.id,
      role: user.role,
    },
    loggedInAt: new Date(),
  });
}

async function adminLogin(event: H3Event, email: string, password: string) {
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.USERNAME_PASSWORD_REQUIRED,
    });
  }

  const foundUser = await prisma.userProfile.findUnique({
    where: { email },
    include: {
      banHistory: {
        orderBy: { bannedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!foundUser || foundUser.role !== UserRole.admin) {
    throw createError({
      statusCode: 401,
      statusMessage: ErrorMessages.INVALID_USERAME_OR_PASSWORD,
    });
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: ErrorMessages.INVALID_USERAME_OR_PASSWORD,
    });
  }

  const latestBan = foundUser?.banHistory?.[0];

  const isStillBanned =
    foundUser?.userStatus === UserStatus.banned &&
    (!latestBan?.banExpiration ||
      new Date(latestBan.banExpiration) > new Date());

  if (isStillBanned) {
    throw createError({
      statusCode: 403,
      statusMessage: `User is banned. Please contant the administration for more details.`,
    });
  }

  await setSession(event, foundUser);

  const updatedUser = await prisma.userProfile.update({
    where: { id: foundUser.id },
    data: {
      lastSeenAt: new Date(),
      userStatus: UserStatus.active,
    },
  });

  return updatedUser;
}

async function createNewUser(
  event: H3Event,
  newUserData: { email: any; password: any; username: any; role: any }
) {
  const isAdminUser = await isAdmin(event);

  if (!isAdminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const { email, password, username, role } = newUserData;

  if (!email || !password || !username || !role) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  const { data, error } = await supabaseClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data?.user) {
    console.error("Supabase error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error?.message,
    });
  }

  const user = await prisma.userProfile.create({
    data: {
      id: data.user.id,
      username,
      role,
      email: email.toLowerCase(),
    },
  });

  return user;
}

async function updateUser(
  event: H3Event,
  userData: {
    id: string;
    username: string;
    userStatus: UserStatus;
    banReason: string;
    banDuration: any;
  }
) {
  const isAdminUser = await isAdmin(event);
  const currentUser = await getCurrentUser(event);

  if (!currentUser) {
    throw createError({
      statusCode: 401,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const { user } = currentUser;

  if (!isAdminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const { id, username, userStatus, banReason, banDuration } = userData;

  const userToUpdate = await prisma.userProfile.findUnique({
    where: { id },
    include: { banHistory: true },
  });

  if (!userToUpdate) {
    throw createError({
      statusCode: 404,
      statusMessage: ErrorMessages.USER_NOT_FOUND,
    });
  }

  const updatedUser = await prisma.userProfile.update({
    where: { id },
    data: {
      username,
      userStatus,
      updatedAt: new Date(),
    },
  });

  if (banReason && banDuration && userStatus === UserStatus.banned) {
    await prisma.banHistory.create({
      data: {
        reason: banReason,
        banExpiration: getBanExpiration(banDuration),
        bannedAt: new Date(),
        user: { connect: { id } },
        bannedBy: { connect: { id: user.id } },
      },
    });

    await prisma.userProfile.update({
      where: { id },
      data: { userStatus: UserStatus.banned },
    });
  }

  return {
    user: updatedUser,
  };
}

async function getCurrentUser(event: H3Event) {
  const session = await getUserSession(event);

  if (!session.user) {
    return null;
  }

  const user = await prisma.userProfile.findUnique({
    where: { id: session.user.id },
    include: {
      banHistory: {
        orderBy: {
          bannedAt: "desc",
        },
      },
    },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: ErrorMessages.USER_NOT_FOUND,
    });
  }

  if (user.userStatus === UserStatus.banned) {
    const latestBan = user.banHistory?.[0];

    if (
      latestBan &&
      (!latestBan.banExpiration ||
        new Date(latestBan.banExpiration) > new Date())
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: "User is banned.",
        data: {
          reason: latestBan.reason,
          banExpiration: latestBan.banExpiration?.toISOString() || null,
        },
      });
    }
  }

  return { user, latestBan: null };
}

async function getUsers(event: H3Event) {
  const isAdminUser = await isAdmin(event);

  if (!isAdminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const oneMinute = 1 * 60 * 1000;
  const now = Date.now();

  const users = await prisma.userProfile.findMany({
    select: {
      id: true,
      username: true,
      steamId: true,
      role: true,
      userStatus: true,
      lastSeenAt: true,
    },
  });

  const usersWithStatus = users.map((user) => ({
    ...user,
    isOnline: user.lastSeenAt
      ? now - new Date(user.lastSeenAt).getTime() < oneMinute
      : false,
  }));

  return usersWithStatus;
}

async function getBanHistories(event: H3Event, userId: string) {
  const isAdminUser = await isAdmin(event);

  if (!isAdminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const bans = await prisma.banHistory.findMany({
    where: { userId },
    orderBy: { bannedAt: "desc" },
    select: {
      id: true,
      reason: true,
      bannedAt: true,
      banExpiration: true,
      bannedBy: {
        select: { id: true, username: true },
      },
    },
  });

  return bans;
}

function generateSteamPassword(steamId: string) {
  // Hash steamId to avoid storing it in plain text as password
  return crypto
    .createHash("sha256")
    .update(steamId + process.env.SOME_SECRET_SALT)
    .digest("hex");
}

async function handleSteamUser(
  event: H3Event,
  steamData: {
    steamId: string;
    username: string;
    avatarUrl: string;
  }
) {
  const { steamId, username, avatarUrl } = steamData;

  let user = await prisma.userProfile.findUnique({
    where: { steamId },
    include: {
      banHistory: {
        orderBy: {
          bannedAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (user?.userStatus === UserStatus.banned) {
    const latestBan = user?.banHistory?.[0];
    const isStillBanned =
      user?.userStatus === UserStatus.banned &&
      (!latestBan?.banExpiration ||
        new Date(latestBan.banExpiration) > new Date());

    if (isStillBanned) {
      return {
        user,
        latestBan: latestBan
          ? {
              reason: latestBan.reason,
              banExpiration: latestBan.banExpiration?.toISOString() || null,
            }
          : null,
      };
    }
  }

  let userId = user?.id;

  const fakeEmail = `steam_${steamId}@steam.local`;
  const steamPassword = generateSteamPassword(steamId);

  // ✅ Update or create user and set userStatus active if not banned
  if (user) {
    user = await prisma.userProfile.update({
      where: { steamId },
      data: {
        username,
        avatarUrl,
        updatedAt: new Date(),
        lastSeenAt: new Date(),
        userStatus: UserStatus.active, // <-- set active here
      },
      include: {
        banHistory: {
          orderBy: {
            bannedAt: "desc",
          },
          take: 1,
        },
      },
    });
  } else {
    // Search existing Auth user by email
    const { data: list } = await supabaseClient.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    let existingAuthUser = list.users.find((u) => u.email === fakeEmail);

    if (!existingAuthUser) {
      const { data: created, error: createErr } =
        await supabaseClient.auth.admin.createUser({
          email: fakeEmail,
          password: steamPassword,
          email_confirm: true,
        });
      if (createErr) {
        throw createError({
          statusCode: 403,
          statusMessage: ErrorMessages.UNAUTHORIZED,
        });
      }
      existingAuthUser = created.user;
    }

    userId = existingAuthUser.id;

    user = await prisma.userProfile.create({
      data: {
        id: userId,
        steamId,
        username,
        avatarUrl,
        role: UserRole.user,
        lastSeenAt: new Date(),
        userStatus: UserStatus.active,
      },
      include: {
        banHistory: {
          orderBy: {
            bannedAt: "desc",
          },
          take: 1,
        },
      },
    });
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: fakeEmail,
    password: steamPassword,
  });

  if (error || !data?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: ErrorMessages.INVALID_USERAME_OR_PASSWORD,
    });
  }

  await setSession(event, user);

  return {
    user,
    latestBan: null,
  };
}

async function logout(event: H3Event) {
  const session = await getUserSession(event);

  if (!session.user) {
    return null;
  }

  const currentUser = await getCurrentUser(event);

  if (!currentUser) {
    throw createError({
      statusCode: 401,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const { user } = currentUser;

  await prisma.userProfile.update({
    where: { id: user.id },
    data: {
      lastSeenAt: new Date(),
    },
  });

  await clearUserSession(event);
}

async function isAdmin(event: H3Event) {
  const session = await getUserSession(event);

  if (!session.user) {
    return null;
  }

  const currentUser = await getCurrentUser(event);

  if (!currentUser) {
    throw createError({
      statusCode: 401,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const { user } = currentUser;

  if (user) {
    return user.role === UserRole.admin;
  }

  return false;
}

async function verifyCurrentUserStatus(event: H3Event) {
  const session = await getUserSession(event);

  if (!session.user) {
    return null;
  }

  const user = await prisma.userProfile.findUnique({
    where: { id: session.user.id },
    include: {
      banHistory: {
        orderBy: {
          bannedAt: "desc",
        },
      },
    },
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  if (user.userStatus === UserStatus.banned) {
    const latestBan = user.banHistory?.[0];

    if (
      latestBan &&
      (!latestBan.banExpiration ||
        new Date(latestBan.banExpiration) > new Date())
    ) {
      return {
        user,
        latestBan: latestBan
          ? {
              reason: latestBan.reason,
              banExpiration: latestBan.banExpiration?.toISOString() || null,
            }
          : null,
      };
    }
  }

  return {
    user,
    latestBan: null,
  };
}

async function getUserSummary(event: H3Event) {
  const isAdminUser = await isAdmin(event);

  if (!isAdminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const totalUsersCount = await prisma.userProfile.count({
    where: {
      role: UserRole.user,
    },
  });

  const oneMinute = 1 * 60 * 1000;
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - oneMinute);

  const totalUsersOnline = await prisma.userProfile.count({
    where: {
      role: UserRole.user,
      lastSeenAt: {
        gte: fiveMinutesAgo,
      },
    },
  });

  return {
    totalUsersOnline,
    totalUsersCount,
  };
}

async function getFeedbackSummary(event: H3Event) {
  const isAdminUser = await isAdmin(event);

  if (!isAdminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const [totalFeedbacks, totalOpenFeedbacks, totalInProgressFeedbacks] =
    await Promise.all([
      prisma.userFeedback.count(),
      prisma.userFeedback.count({ where: { status: FeedbackStatus.open } }),
      prisma.userFeedback.count({
        where: { status: FeedbackStatus.in_progress },
      }),
    ]);

  return {
    totalOpenFeedbacks,
    totalInProgressFeedbacks,
    totalFeedbacks,
  };
}

async function deleteUser(event: H3Event, userId: string) {
  const isAdminUser = await isAdmin(event);

  if (!isAdminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const targetUser = await prisma.userProfile.findUnique({
    where: {
      id: userId,
    },
  });

  if (!targetUser) {
    throw createError({
      statusCode: 404,
      statusMessage: ErrorMessages.USER_NOT_FOUND,
    });
  }

  await prisma.userProfile.delete({
    where: {
      id: userId,
    },
  });

  const { error } = await supabaseClient.auth.admin.deleteUser(userId);

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete from Supabase Auth: ${error.message}`,
    });
  }

  return { success: true };
}

export default {
  setSession,
  getCurrentUser,
  adminLogin,
  isAdmin,
  createNewUser,
  updateUser,
  getUsers,
  getBanHistories,
  handleSteamUser,
  logout,
  verifyCurrentUserStatus,
  getUserSummary,
  getFeedbackSummary,
  deleteUser,
};
