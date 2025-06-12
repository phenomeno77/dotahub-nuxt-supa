// server/api/admin/create-user.post.ts
import { supabaseClient } from "~/server/utils/supabaseClient";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { email, password, username, role } = body;

  if (!email || !password || !username || !role) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  const { data, error } = await supabaseClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
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
      email,
    },
  });

  return {
    success: true,
    user,
  };
});
