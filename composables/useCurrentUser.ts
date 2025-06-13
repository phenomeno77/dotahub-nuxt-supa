import type { user_profile } from "@prisma/client";

export const useCurrentUser = async () => {
  const user = useState<user_profile | null>("currentUser", () => null);

  if (!user.value) {
    const { loggedIn } = useUserSession();

    if (!loggedIn.value) return null;

    const { data, error } = await useFetch<user_profile>("/api/auth/me");

    if (!error.value && data.value) {
      user.value = data.value;
    }
  }

  return user.value;
};
