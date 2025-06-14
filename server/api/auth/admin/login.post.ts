import auth from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  const user = await auth.adminLogin(event, email, password);

  return {
    user,
    redirectTo: "/admin-dashboard",
  };
});
