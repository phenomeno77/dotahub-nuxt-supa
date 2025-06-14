export default defineEventHandler(async (event) => {
  await requireUserLoggedIn(event);

  const body = await readBody(event);

  const user = await auth.createNewUser(event, body);

  return {
    success: true,
    user,
  };
});
