import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const userId = query.id as string;

  if (!userId) {
    throw createError({ statusCode: 400, message: "User ID is required" });
  }

  const user = await prisma.user_profile.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  return user;
});
