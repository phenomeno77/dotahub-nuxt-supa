import auth from "~/server/utils/auth";
import requireUserLoggedIn from "~/server/utils/requireUserLoggedIn";

export default defineEventHandler(async (event) => {
  try {
    await requireUserLoggedIn(event);
    const user = await auth.currentUser(event);

    return user;
  } catch (err: any) {
    throw createError({
      statusCode: 401,
      statusMessage: "Login required",
    });
  }
});
