import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";

const authSecret = process.env.BETTER_AUTH_SECRET;

if (!authSecret) {
  throw new Error("BETTER_AUTH_SECRET is missing");
}

const authUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const PERSISTENT_SESSION_AGE = 60 * 60 * 24 * 400;

export const auth = betterAuth({
  secret: authSecret,
  baseURL: authUrl,
  trustedOrigins: [authUrl],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    // Browsers cap cookie Max-Age at 400 days. Rolling refresh keeps this long-lived.
    expiresIn: PERSISTENT_SESSION_AGE,
    updateAge: 60 * 60 * 24 * 30,
  },
  plugins: [nextCookies()],
});
