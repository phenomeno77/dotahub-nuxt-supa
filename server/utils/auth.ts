import { UserProfile, UserRole, UserStatus } from "@prisma/client";
import { type H3Event } from "h3";
import prisma from "~/lib/prisma";
import { ErrorMessages } from "../constants/errors";

async function setSession(event: H3Event<Request>, user: UserProfile) {
  await replaceUserSession(event, {
    user: {
      id: user.id,
      role: user.role,
    },
    loggedInAt: new Date(),
  });
}

async function adminLogin(
  event: H3Event<Request>,
  email: string,
  password: string
) {
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.USERNAME_PASSWORD_REQUIRED,
    });
  }

  const foundUser = await prisma.userProfile.findUnique({
    where: { email: email },
  });

  if (
    !foundUser ||
    foundUser.role !== UserRole.admin ||
    foundUser.userStatus !== UserStatus.active
  ) {
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

  await setSession(event, foundUser);

  return foundUser;
}

async function createNewUser(
  event: H3Event<Request>,
  newUserData: { email: any; password: any; username: any; role: any }
) {
  const isAdmin = await auth.isAdmin(event);

  if (!isAdmin) {
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
      email,
    },
  });

  return user;
}

async function getCurrentUser(event: H3Event<Request>) {
  const session = await getUserSession(event);

  if (!session.user) {
    return null;
  }

  const result = await prisma.userProfile.findUnique({
    where: { id: session.user.id },
  });

  return result;
}

async function isAdmin(event: H3Event<Request>) {
  const session = await getUserSession(event);

  if (!session.user) {
    return null;
  }

  const current = await getCurrentUser(event);

  if (current) {
    return current.role === UserRole.admin;
  }

  return false;
}

async function getUsers(event: H3Event<Request>) {
  const isAdmin = await auth.isAdmin(event);

  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.UNAUTHORIZED,
    });
  }

  const users = await prisma.userProfile.findMany({
    include: {
      banHistory: true,
    },
  });

  return users;
}

export default {
  setSession,
  currentUser: getCurrentUser,
  adminLogin,
  isAdmin,
  createNewUser,
  getUsers,
};
