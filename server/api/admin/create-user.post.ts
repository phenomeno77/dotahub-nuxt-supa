// server/api/admin/create-user.post.ts
import { supabaseAdmin } from "~/server/utils/supabaseAdmin";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { email, password, username, role } = body;

  if (!email || !password || !username || !role) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
  });

  if (error || !data?.user) {
    console.error("Supabase error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create Supabase user",
    });
  }

  const user = await prisma.user_profile.create({
    data: {
      id: data.user.id,
      username,
      role,
    },
  });

  return {
    success: true,
    user,
  };
});
