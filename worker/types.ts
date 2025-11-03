import type { AuthSession, AuthUser } from "./lib/auth/types";

export type HonoAppType = {
  Bindings: CloudflareBindings;
  Variables: {
    user: AuthUser | null;
    session: AuthSession | null;
  };
};
