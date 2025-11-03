import { createMiddleware } from "hono/factory";
import type { HonoAppType } from "../../types";
import { createAuth } from "./auth";
import type { AuthSession, AuthUser } from "./types";

export const authProvider = createMiddleware<{
  Bindings: HonoAppType["Bindings"];
  Variables: {
    user: AuthUser | null;
    session: AuthSession | null;
  };
}>(async (c, next) => {
  const auth = createAuth(c.env);
  // const session = await auth.api.getSession(c.req.raw);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  // excuse the typecast, but promise it will work
  c.set("session", session);
  c.set("user", session.user);

  await next();
});
