export default defineOAuthSteamEventHandler({
  async onSuccess(event, { user }) {
    const steamUser = {
      steamId: user.steamid,
      username: user.personaname,
      avatarUrl: user.avatarfull,
    };

    const currentUser = await handleSteamUser(event, steamUser);

    if (currentUser.latestBan) {
      const query = new URLSearchParams({
        error: "account_banned",
        banReason: encodeURIComponent(currentUser.latestBan.reason),
      });

      if (currentUser.latestBan.banExpiration) {
        query.set(
          "banExpiration",
          encodeURIComponent(currentUser.latestBan.banExpiration)
        );
      }

      return sendRedirect(event, `/?${query.toString()}`);
    }

    // ✅ Success: redirect to callback
    return sendRedirect(event, "/steam/callback");
  },

  onError(event, error) {
    console.error("Steam login failed:", error);
    return sendRedirect(event, "/?error=steam_login_failed");
  },
});
