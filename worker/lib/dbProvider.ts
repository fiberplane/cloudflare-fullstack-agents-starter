import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";
import * as schema from "../db/schema";
import type { HonoAppType } from "../types";

export const dbProvider = createMiddleware<{
  Bindings: HonoAppType["Bindings"];
  Variables: {
    db: DrizzleD1Database<typeof schema>;
  };
}>(async (c, next) => {
  const db = drizzle(c.env.DB, {
    schema,
    casing: "snake_case",
  });

  c.set("db", db);
  await next();
});
