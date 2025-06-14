import auth from "~/server/utils/auth";
import requireUserLoggedIn from "~/server/utils/requireUserLoggedIn";

export default defineEventHandler(async (event) => {
  await requireUserLoggedIn(event);

  const user = await auth.currentUser(event);

  return user;
});
