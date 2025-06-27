import auth from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  try {
    const user = await auth.adminLogin(event, email, password);

    return {
      success: true,
      user,
    };
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode,
      statusMessage: err.statusMessage,
    });
  }
});
