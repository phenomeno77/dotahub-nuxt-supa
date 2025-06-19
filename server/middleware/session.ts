import session from "express-session";

export default defineEventHandler(async (event) => {
  const req = event.node.req as any;
  const res = event.node.res as any;

  await new Promise<void>((resolve, reject) => {
    session({
      secret: process.env.SESSION_SECRET!, // put this in env var
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        secure: false, // set to true in prod with HTTPS
      },
    })(req, res, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
});
