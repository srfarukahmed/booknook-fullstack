import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { MongoClient, Db } from "mongodb";
import { z } from "zod";

export function getConfig() {
  const schema = z.object({
    MONGODB_URI: z.string().min(1),
    MONGODB_DB: z
      .string()
      .regex(/^[a-zA-Z0-9_-]+$/)
      .default("booknook"),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    JWT_AUDIENCE: z.string().min(1).default("booknook-api"),
    CLIENT_ORIGIN: z.url(),
    PORT: z.coerce.number().int().min(1).max(65535).default(5000),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
  });
  const result = schema.safeParse(process.env);
  if (!result.success)
    throw new Error(
      "Invalid environment configuration: " +
        result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
    );
  const config = result.data;
  if (config.BETTER_AUTH_SECRET.startsWith("REPLACE_"))
    throw new Error("Run npm run setup or set a random BETTER_AUTH_SECRET.");
  if (Boolean(config.GOOGLE_CLIENT_ID) !== Boolean(config.GOOGLE_CLIENT_SECRET))
    throw new Error(
      "Set both Google client ID and secret, or leave both empty.",
    );
  const unsafeOrigin = (value: string) => {
    const url = new URL(value);
    return (
      url.protocol !== "https:" &&
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    );
  };
  if (
    config.NODE_ENV === "production" &&
    [config.BETTER_AUTH_URL, config.CLIENT_ORIGIN].some(unsafeOrigin)
  )
    throw new Error(
      "Production auth and client origins must use HTTPS (except local loopback).",
    );
  return config;
}
type Connection = { client: MongoClient; db: Db };
const globalCache = globalThis as typeof globalThis & {
  booknookConnection?: Promise<Connection>;
  booknookAuth?: Pick<ReturnType<typeof betterAuth>, "handler" | "api">;
};
export async function connectDatabase(): Promise<Connection> {
  if (!globalCache.booknookConnection) {
    const config = getConfig();
    const client = new MongoClient(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      maxPoolSize: 20,
    });
    globalCache.booknookConnection = client
      .connect()
      .then(() => ({ client, db: client.db(config.MONGODB_DB) }))
      .catch((e) => {
        globalCache.booknookConnection = undefined;
        throw e;
      });
  }
  return globalCache.booknookConnection;
}
export async function closeDatabase() {
  const connection = await globalCache.booknookConnection;
  await connection?.client.close();
  globalCache.booknookConnection = undefined;
  globalCache.booknookAuth = undefined;
}
export async function getAuth(): Promise<
  Pick<ReturnType<typeof betterAuth>, "handler" | "api">
> {
  if (globalCache.booknookAuth) return globalCache.booknookAuth;
  const config = getConfig();
  const { client, db } = await connectDatabase();
  const auth = betterAuth({
    appName: "BookNook",
    baseURL: config.BETTER_AUTH_URL,
    secret: config.BETTER_AUTH_SECRET,
    trustedOrigins: [config.CLIENT_ORIGIN],
    database: mongodbAdapter(db, { client }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 6,
      maxPasswordLength: 128,
      autoSignIn: false,
    },
    socialProviders:
      config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: config.GOOGLE_CLIENT_ID,
              clientSecret: config.GOOGLE_CLIENT_SECRET,
            },
          }
        : undefined,
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": {
          window: 60,
          max: config.NODE_ENV === "test" ? 100 : 10,
        },
        "/sign-up/email": {
          window: 60,
          max: config.NODE_ENV === "test" ? 100 : 5,
        },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path === "/sign-up/email") {
          const password = ctx.body?.password;
          if (
            typeof password !== "string" ||
            password.length < 6 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password)
          )
            throw new APIError("BAD_REQUEST", {
              message:
                "Password must have at least 6 characters, one uppercase and one lowercase letter.",
            });
          const name = ctx.body?.name;
          if (
            typeof name !== "string" ||
            !name.trim() ||
            name.trim().length > 80
          )
            throw new APIError("BAD_REQUEST", {
              message: "Name must contain 1 to 80 characters.",
            });
        }
      }),
    },
    plugins: [
      jwt({
        jwks: { keyPairConfig: { alg: "EdDSA" } },
        jwt: {
          issuer: config.BETTER_AUTH_URL,
          audience: config.JWT_AUDIENCE,
          expirationTime: "15m",
          definePayload: ({ user, session }) => ({
            sub: user.id,
            sid: session.id,
          }),
        },
      }),
    ],
  });
  globalCache.booknookAuth = auth;
  return auth;
}
