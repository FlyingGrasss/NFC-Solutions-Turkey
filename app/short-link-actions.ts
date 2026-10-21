"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminMember, requireSession } from "@/lib/auth-helpers";

export type ShortLinkFormState = {
  error?: string;
  success?: string;
};

const slugPattern = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

function parseShortLinkFields(formData: FormData) {
  const slugValue = formData.get("slug");
  const targetUrlValue = formData.get("targetUrl");
  const slug = typeof slugValue === "string" ? slugValue.trim().toLowerCase() : "";
  const targetUrlInput = typeof targetUrlValue === "string" ? targetUrlValue.trim() : "";

  if (!slug || !slugPattern.test(slug)) {
    return { error: "Kısa kod yalnızca küçük harf, rakam ve ara çizgi içerebilir; 1–80 karakter olmalıdır." } as const;
  }

  if (!targetUrlInput || targetUrlInput.length > 2000) {
    return { error: "Geçerli bir hedef bağlantısı girin." } as const;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(targetUrlInput);
  } catch {
    return { error: "Hedef bağlantısı geçerli bir URL olmalıdır." } as const;
  }

  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return { error: "Hedef bağlantısı http:// veya https:// ile başlamalıdır." } as const;
  }

  if (targetUrl.username || targetUrl.password) {
    return { error: "Kullanıcı adı veya şifre içeren bağlantılar kullanılamaz." } as const;
  }

  return { value: { slug, targetUrl: targetUrl.toString() } } as const;
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Error && error.message.includes("Unique constraint");
}

export async function createShortLinkAction(
  _previousState: ShortLinkFormState,
  formData: FormData,
): Promise<ShortLinkFormState> {
  await requireSession();
  await requireAdminMember();
  const parsed = parseShortLinkFields(formData);

  if ("error" in parsed) return { error: parsed.error };

  try {
    await prisma.shortLink.create({ data: parsed.value });
  } catch (error) {
    console.error("[createShortLinkAction] Short link creation failed", error);
    return {
      error: isUniqueConstraintError(error)
        ? "Bu kısa kod zaten kullanılıyor."
        : "Kısa bağlantı oluşturulamadı.",
    };
  }

  revalidatePath("/admin/links");
  return { success: "Kısa bağlantı oluşturuldu." };
}

export async function updateShortLinkAction(
  _previousState: ShortLinkFormState,
  formData: FormData,
): Promise<ShortLinkFormState> {
  await requireSession();
  await requireAdminMember();
  const id = formData.get("id");
  const parsed = parseShortLinkFields(formData);

  if (typeof id !== "string" || !id) return { error: "Kısa bağlantı bulunamadı." };
  if ("error" in parsed) return { error: parsed.error };

  try {
    const result = await prisma.shortLink.updateMany({
      where: { id },
      data: parsed.value,
    });

    if (result.count !== 1) return { error: "Kısa bağlantı bulunamadı." };
  } catch (error) {
    console.error("[updateShortLinkAction] Short link update failed", error);
    return {
      error: isUniqueConstraintError(error)
        ? "Bu kısa kod zaten kullanılıyor."
        : "Kısa bağlantı güncellenemedi.",
    };
  }

  revalidatePath("/admin/links");
  revalidatePath(`/r/${parsed.value.slug}`);
  return { success: "Kısa bağlantı güncellendi." };
}

export async function deleteShortLinkAction(formData: FormData) {
  await requireSession();
  await requireAdminMember();
  const id = formData.get("id");

  if (typeof id !== "string" || !id) return;

  await prisma.shortLink.deleteMany({ where: { id } });
  revalidatePath("/admin/links");
}
