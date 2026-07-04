import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import { logger } from "./lib/logger";
import router from "./routes";

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173",
      "http://localhost:3000",
      `https://${process.env.REPLIT_DEV_DOMAIN}`,
      process.env.REPLIT_DEPLOYMENT_URL,
    ].filter(Boolean) as string[];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server) and allowlisted origins
      if (!origin || ALLOWED_ORIGINS.some((o) => origin.startsWith(o))) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

// Global error handler — must have 4 params for Express to recognize it
app.use((err: unknown, req: import("express").Request, res: import("express").Response, _next: import("express").NextFunction) => {
  const status = (err as { status?: number }).status ?? 500;
  const message =
    process.env.NODE_ENV === "production"
      ? status >= 500 ? "Internal server error" : String((err as { message?: string }).message ?? err)
      : String((err as { message?: string }).message ?? err);
  req.log?.error({ err }, "Unhandled error");
  if (!res.headersSent) {
    res.status(status).json({ error: message });
  }
});

export default app;
