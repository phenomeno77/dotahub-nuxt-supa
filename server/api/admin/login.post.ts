import { supabaseClient } from "~/server/utils/supabaseClient";
import prisma from "~/lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import { ErrorMessages } from "~/server/constants/errors";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.USERNAME_PASSWORD_REQUIRED,
    });
  }

  const user = await prisma.user_profile.findUnique({
    where: { email: email },
  });

  if (
    !user ||
    user.role !== UserRole.admin ||
    user.userStatus !== UserStatus.active
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: ErrorMessages.NO_PERMISSION,
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

  const updatedUser = await prisma.user_profile.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      isLoggedIn: true,
    },
  });

  return {
    success: true,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: updatedUser,
  };
});
