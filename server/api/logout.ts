import { supabaseClient } from "~/server/utils/supabaseClient";
import prisma from "~/lib/prisma";
import { ErrorMessages } from "../constants/errors";

export default defineEventHandler(async (event) => {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: ErrorMessages.INTERNAL_SERVER_ERROR,
    });
  }

  await prisma.user_profile.update({
    where: { id: data.user.id },
    data: {
      isLoggedIn: false,
    },
  });

  await supabaseClient.auth.signOut();

  return { success: true };
});
