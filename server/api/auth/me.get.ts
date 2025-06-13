import prisma from "~/lib/prisma";
import requireUserLoggedIn from "~/server/utils/requireUserLoggedIn";

export default defineEventHandler(async (event) => {
  await requireUserLoggedIn(event);

  const session = await getUserSession(event);

  const user = session.user as { id: string; [key: string]: any };

  if (!user?.id)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const dbUser = await prisma.user_profile.findUnique({
    where: { id: user.id },
  });

  if (!dbUser)
    throw createError({ statusCode: 404, statusMessage: "User not found" });

  return dbUser;
});
