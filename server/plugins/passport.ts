import passport from "passport";
import { Strategy as SteamStrategy } from "passport-steam";

export default defineNitroPlugin((nitroApp) => {
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  passport.use(
    new SteamStrategy(
      {
        returnURL: "http://localhost:3000/api/auth/steam/return",
        realm: "http://localhost:3000/",
        apiKey: process.env.STEAM_API_KEY!,
      },
      (identifier, profile, done) => {
        const user = {
          steamId: profile.id,
          username: profile.displayName,
          avatar: profile.photos?.[0]?.value,
        };
        done(null, user);
      }
    )
  );

  nitroApp.hooks.hook("request", (event) => {
    const req = event.node.req as any;
    const res = event.node.res as any;

    // Init passport and session for every request
    passport.initialize()(req, res, () => {
      passport.session()(req, res, () => {});
    });
  });
});
