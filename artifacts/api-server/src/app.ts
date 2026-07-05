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

// Build exact-match origin set.
// REPLIT_DOMAINS is a comma-separated list of domains assigned to this repl
// (present in both dev and deployment environments).
function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>();

  // Manually overridden allowlist takes priority
  if (process.env.ALLOWED_ORIGINS) {
    for (const o of process.env.ALLOWED_ORIGINS.split(",")) {
      const t = o.trim();
      if (t) origins.add(t);
    }
    return origins;
  }

  // Local dev
  origins.add("http://localhost:5173");
  origins.add("http://localhost:3000");

  // Replit dev-preview domain
  if (process.env.REPLIT_DEV_DOMAIN) {
    origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  }

  // Replit deployment URL (explicit, if set)
  if (process.env.REPLIT_DEPLOYMENT_URL) {
    // Strip trailing slashes, ensure it is an origin not a full URL
    try {
      origins.add(new URL(process.env.REPLIT_DEPLOYMENT_URL).origin);
    } catch {
      origins.add(process.env.REPLIT_DEPLOYMENT_URL.replace(/\/+$/, ""));
    }
  }

  // REPLIT_DOMAINS — comma-separated hostnames for this specific repl
  // (covers both *.replit.dev and *.replit.app deployment domains)
  if (process.env.REPLIT_DOMAINS) {
    for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
      const d = domain.trim();
      if (d) origins.add(`https://${d}`);
    }
  }

  return origins;
}

const ALLOWED_ORIGINS = buildAllowedOrigins();

function isOriginAllowed(origin: string): boolean {
  try {
    // Normalise to bare origin (scheme + host + port) before comparing
    const normalised = new URL(origin).origin;
    return ALLOWED_ORIGINS.has(normalised);
  } catch {
    return false;
  }
}

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server)
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
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
