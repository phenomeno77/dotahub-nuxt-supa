import passport from "passport";

export default defineEventHandler(async (event) => {
  const req = event.node.req as any;
  const res = event.node.res as any;

  await new Promise<void>((resolve) => {
    passport.authenticate("steam", (err: any, user: any) => {
      if (err || !user) {
        res.writeHead(302, { Location: "/" });
        res.end();
        return resolve();
      }
      req.login(user, (loginErr: any) => {
        if (loginErr) {
          res.writeHead(302, { Location: "/" });
          res.end();
          return resolve();
        }
        res.writeHead(302, { Location: "/" }); // redirect after success
        res.end();
        resolve();
      });
    })(req, res);
  });
});
