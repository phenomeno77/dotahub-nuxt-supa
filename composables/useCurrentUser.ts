import type { UserProfile } from "~/types/userProfile";

// Correctly typed composable
export const useCurrentUser = async () => {
  const user = useState<UserProfile | null>("currentUser", () => null);

  if (!user.value) {
    const authUser = useSupabaseUser();
    if (!authUser.value) return null;

    const { data, error } = await useFetch<UserProfile>("/api/user/profile", {
      query: { id: authUser.value.id },
    });

    if (!error.value) {
      user.value = data.value;
    }
  }

  return user.value;
};
