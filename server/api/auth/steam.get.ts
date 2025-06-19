import passport from "passport";

export default defineEventHandler(async (event) => {
  const req = event.node.req as any;
  const res = event.node.res as any;

  await new Promise<void>((resolve, reject) => {
    passport.authenticate("steam")(req, res, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
});
