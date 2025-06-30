import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  await prisma.userProfile.update({
    where: { id: session.user.id },
    data: { lastSeenAt: new Date() },
  });

  return { success: true };
});
