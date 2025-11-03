import { Hono } from "hono";
import { allowListMiddleware } from "../lib/auth/allow-list";
import type { HonoAppType } from "../types";
import { agentsRouter } from "./agents";

/**
 * Authenticated API routes
 */
export const coreApi = new Hono<HonoAppType>()
  .use(allowListMiddleware)
  .route("/agents", agentsRouter);
