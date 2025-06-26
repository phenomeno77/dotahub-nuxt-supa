import { handleSteamUser } from "~/server/utils/auth";

export default defineOAuthSteamEventHandler({
  async onSuccess(event, { user }) {
    return sendRedirect(event, "/login?error=steam_login_failed");

    const steamUser = {
      steamId: user.steamid,
      username: user.personaname,
      avatarUrl: user.avatarfull,
    };

    await handleSteamUser(event, steamUser);

    return sendRedirect(event, "/steam/callback");
  },

  onError(event, error) {
    console.error("Steam login failed:", error);
    return sendRedirect(event, "/login?error=steam_login_failed");
  },
});
