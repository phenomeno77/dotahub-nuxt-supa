import { UserProfile, UserRole, UserStatus } from "@prisma/client";
import { type H3Event } from "h3";
import prisma from "~/lib/prisma";
import { ErrorMessages } from "../constants/labels";
import { getBanExpiration } from "./banUtils";

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

  const fiveMinutes = 5 * 60 * 1000;
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
      ? now - new Date(user.lastSeenAt).getTime() < fiveMinutes
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
    user = await prisma.userProfile.create({
      data: {
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
};
