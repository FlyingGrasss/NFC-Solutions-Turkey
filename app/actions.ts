"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  MEMBER_COOKIE,
  requireMember,
  requireSession,
} from "@/lib/auth-helpers";

const SHARED_AUTH_EMAIL = "gelir-gider@local.test";
const PERSISTENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export type LoginState = {
  error?: string;
};

export type FormState = {
  error?: string;
  success?: string;
};

export async function signInAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const nameValue = formData.get("name");
  const password = formData.get("password");

  const name =
    typeof nameValue === "string"
      ? nameValue.trim().replace(/\s+/g, " ")
      : "";

  if (name.length < 2 || name.length > 40) {
    return { error: "Adınızı 2-40 karakter arasında girin." };
  }

  if (typeof password !== "string" || password !== process.env.APP_PASSWORD) {
    return { error: "Şifre hatalı. Tekrar deneyin." };
  }

  const requestHeaders = await headers();

  try {
    const currentSession = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!currentSession) {
      const existingUser = await prisma.user.findUnique({
        where: { email: SHARED_AUTH_EMAIL },
        select: { id: true },
      });

      if (existingUser) {
        try {
          await auth.api.signInEmail({
            body: {
              email: SHARED_AUTH_EMAIL,
              password,
              rememberMe: true,
            },
            headers: requestHeaders,
          });
        } catch (_signInError) {
          // Password changed in APP_PASSWORD: clear stale user & recreate with new password
          await prisma.user.delete({
            where: { id: existingUser.id },
          });

          await auth.api.signUpEmail({
            body: {
              name: "Gelir Gider",
              email: SHARED_AUTH_EMAIL,
              password,
              rememberMe: true,
            },
            headers: requestHeaders,
          });
        }
      } else {
        await auth.api.signUpEmail({
          body: {
            name: "Gelir Gider",
            email: SHARED_AUTH_EMAIL,
            password,
            rememberMe: true,
          },
          headers: requestHeaders,
        });
      }
    }

    const member = await prisma.member.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    (await cookies()).set(MEMBER_COOKIE, member.id, {
      httpOnly: true,
      maxAge: PERSISTENT_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.error("[signInAction] Better Auth sign-in failed", error);
    return { error: "Giriş yapılamadı. Sunucu ayarlarını kontrol edin." };
  }

  redirect("/admin");
}

type PayerValidation = { id: string | null } | { error: string };

async function parsePaidByMemberId(value: FormDataEntryValue | null): Promise<PayerValidation> {
  if (value === null || value === "SPLIT") {
    return { id: null };
  }

  if (typeof value !== "string" || !value) {
    return { error: "Ödeyen seçimi geçersiz." };
  }

  const member = await prisma.member.findUnique({
    where: { id: value },
    select: { id: true },
  });

  return member ? { id: member.id } : { error: "Ödeyen seçimi geçersiz." };
}

function parseAmount(value: string) {
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
    return null;
  }

  return Math.round(amount * 100);
}

export async function addTransactionAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  const member = await requireMember();
  const type = formData.get("type");
  const amountValue = formData.get("amount");
  const descriptionValue = formData.get("description");
  const dateValue = formData.get("date");
  const paidByMember = await parsePaidByMemberId(formData.get("paidByMemberId"));

  if ("error" in paidByMember) {
    return { error: paidByMember.error };
  }

  if (type !== "INCOME" && type !== "EXPENSE") {
    return { error: "Kayıt türünü seçin." };
  }

  if (typeof amountValue !== "string") {
    return { error: "Geçerli bir tutar girin." };
  }

  const amountCents = parseAmount(amountValue.trim());

  if (!amountCents) {
    return { error: "Geçerli bir tutar girin." };
  }

  if (typeof dateValue !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return { error: "Geçerli bir tarih seçin." };
  }

  const date = new Date(`${dateValue}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return { error: "Geçerli bir tarih seçin." };
  }

  const description =
    typeof descriptionValue === "string" && descriptionValue.trim()
      ? descriptionValue.trim().slice(0, 120)
      : "Açıklama yok";

  await prisma.transaction.create({
    data: {
      type,
      amountCents,
      description,
      date,
      createdByName: member.name,
      paidByMemberId: paidByMember.id,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: "Kayıt eklendi." };
}

export async function updateTransactionAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  await requireMember();
  const id = formData.get("id");
  const type = formData.get("type");
  const amountValue = formData.get("amount");
  const descriptionValue = formData.get("description");
  const dateValue = formData.get("date");
  const paidByMember = await parsePaidByMemberId(formData.get("paidByMemberId"));

  if ("error" in paidByMember) {
    return { error: paidByMember.error };
  }

  if (typeof id !== "string" || !id) {
    return { error: "Düzenlenecek kayıt bulunamadı." };
  }

  if (type !== "INCOME" && type !== "EXPENSE") {
    return { error: "Kayıt türünü seçin." };
  }

  if (typeof amountValue !== "string") {
    return { error: "Geçerli bir tutar girin." };
  }

  const amountCents = parseAmount(amountValue.trim());

  if (!amountCents) {
    return { error: "Geçerli bir tutar girin." };
  }

  if (typeof dateValue !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return { error: "Geçerli bir tarih seçin." };
  }

  const date = new Date(`${dateValue}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return { error: "Geçerli bir tarih seçin." };
  }

  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (!existingTransaction) {
    return { error: "Bu kayıt bulunamadı." };
  }

  const description =
    typeof descriptionValue === "string" && descriptionValue.trim()
      ? descriptionValue.trim().slice(0, 120)
      : "Açıklama yok";

  await prisma.transaction.update({
    where: { id: existingTransaction.id },
    data: {
      type,
      amountCents,
      description,
      date,
      paidByMemberId: paidByMember.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteTransactionAction(formData: FormData) {
  const session = await requireSession();
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return;
  }

  await prisma.transaction.deleteMany({
    where: {
      id,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function splitAllTransactionsAction(): Promise<FormState> {
  const session = await requireSession();
  await requireMember();

  const result = await prisma.transaction.updateMany({
    where: { userId: session.user.id },
    data: { paidByMemberId: null },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return { success: `${result.count} kayıt Bölüşüldü olarak işaretlendi.` };
}

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/sign-in");
}
