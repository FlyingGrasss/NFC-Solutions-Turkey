import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const PROFILE_SESSION_COOKIE = "gelir-gider-profile-session";
const PROFILE_SESSION_MAX_AGE = 60 * 60 * 24 * 400;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createProfileSession(profileId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + PROFILE_SESSION_MAX_AGE * 1000);

  await prisma.profileSession.deleteMany({
    where: { profileId },
  });
  await prisma.profileSession.create({
    data: {
      tokenHash: hashToken(token),
      expiresAt,
      profileId,
    },
  });

  (await cookies()).set(PROFILE_SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: PROFILE_SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getProfileAdmin(slug: string) {
  const token = (await cookies()).get(PROFILE_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.profileSession.findFirst({
    where: {
      tokenHash: hashToken(token),
      expiresAt: { gt: new Date() },
      profile: { slug },
    },
    include: { profile: true },
  });

  return session?.profile ?? null;
}

export async function requireProfileAdmin(slug: string) {
  const profile = await getProfileAdmin(slug);

  if (!profile) {
    redirect(`/${slug}/admin`);
  }

  return profile;
}

export async function clearProfileSession() {
  const token = (await cookies()).get(PROFILE_SESSION_COOKIE)?.value;

  if (token) {
    await prisma.profileSession.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  (await cookies()).delete(PROFILE_SESSION_COOKIE);
}
