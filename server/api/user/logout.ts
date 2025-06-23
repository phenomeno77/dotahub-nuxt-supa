export default defineEventHandler(async (event) => {
  await requireUserLoggedIn(event);
  await auth.logout(event);

  return sendRedirect(event, "/", 302);
});
