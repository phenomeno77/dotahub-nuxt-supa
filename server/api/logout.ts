import { serverSupabaseClient } from "#supabase/server";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: true };
  }

  await prisma.user_profile.update({
    where: { id: user.id },
    data: { isLoggedIn: false },
  });

  await clearUserSession(event);

  return { success: true };
});
