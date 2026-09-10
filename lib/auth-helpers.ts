import { headers } from "next/headers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const MEMBER_COOKIE = "gelir-gider-member";

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function getCurrentMember() {
  const memberId = (await cookies()).get(MEMBER_COOKIE)?.value;

  if (!memberId) {
    return null;
  }

  return prisma.member.findUnique({
    where: { id: memberId },
  });
}

export async function requireMember() {
  const member = await getCurrentMember();

  if (!member) {
    redirect("/sign-in");
  }

  return member;
}

export async function requireAdminMember() {
  const member = await requireMember();
  if (member.role !== "ADMIN") redirect("/admin");
  return member;
}
