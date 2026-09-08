"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export type ContactFormState = {
  error?: string;
  success?: string;
};

function textValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

async function verifyTurnstile(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return { error: "Güvenlik doğrulaması henüz yapılandırılmadı." } as const;
  }

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const remoteip = forwardedFor?.split(",")[0]?.trim();

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        ...(remoteip ? { remoteip } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const result = (await response.json()) as { success?: boolean; action?: string };

    if (!response.ok || !result.success || (result.action && result.action !== "contact")) {
      return { error: "Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin." } as const;
    }
  } catch (error) {
    console.error("[submitContactAction] Turnstile verification failed", error);
    return { error: "Güvenlik doğrulaması yapılamadı. Lütfen tekrar deneyin." } as const;
  }

  return { ok: true } as const;
}

export async function submitContactAction(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  if (textValue(formData, "website")) {
    return { success: "Mesajınız alındı. En kısa sürede size dönüş yapacağız." };
  }

  const name = textValue(formData, "name").slice(0, 100);
  const contact = textValue(formData, "contact").slice(0, 160);
  const message = textValue(formData, "message").slice(0, 2000);
  const token = textValue(formData, "turnstileToken");

  if (name.length < 2 || contact.length < 3 || message.length < 10) {
    return { error: "Lütfen adınızı, iletişim bilginizi ve mesajınızı eksiksiz girin." };
  }

  if (!token) {
    return { error: "Lütfen güvenlik doğrulamasını tamamlayın." };
  }

  const verification = await verifyTurnstile(token);
  if ("error" in verification) {
    return verification;
  }

  try {
    await prisma.contactMessage.create({
      data: { name, contact, message },
    });
  } catch (error) {
    console.error("[submitContactAction] Contact message creation failed", error);
    return { error: "Mesaj gönderilemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/admin/messages");
  return { success: "Mesajınız alındı. En kısa sürede size dönüş yapacağız." };
}
