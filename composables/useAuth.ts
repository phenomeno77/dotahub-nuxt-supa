import { useStorage } from "@vueuse/core";

export const useAuth = () => {
  const username = useStorage<string | null>("auth-username", null);
  const avatarUrl = useStorage<string | null>("auth-avatar", null);
  const loggedIn = useStorage<boolean>("auth-logged-in", false);
  const userRole = useStorage<string | null>("auth-role", null);
  const id = useStorage<number | null>("auth-id", null);

  const login = (userData: {
    id: number;
    role: string;
    username: string;
    avatarUrl?: string | null;
  }) => {
    username.value = userData.username;
    userRole.value = userData.role;
    id.value = userData.id;
    avatarUrl.value = userData.avatarUrl || null;
    loggedIn.value = true;
  };

  const logout = () => {
    username.value = null;
    userRole.value = null;
    id.value = null;
    avatarUrl.value = null;
    loggedIn.value = false;
  };

  const checkAuth = () => {
    // Already handled via `useStorage`, but you can include additional checks here
    if (!username.value || !userRole.value || !id.value) {
      logout();
    }
  };

  return {
    username,
    avatarUrl,
    loggedIn,
    userRole,
    id,
    login,
    logout,
    checkAuth,
  };
};
