"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireMember, requireSession } from "@/lib/auth-helpers";

export type StockFormState = {
  error?: string;
  success?: string;
};

function parseWholeNumber(value: FormDataEntryValue | null, options: { allowZero?: boolean } = {}) {
  if (typeof value !== "string" || !/^\d+$/.test(value.trim())) {
    return null;
  }

  const number = Number(value);
  const minimum = options.allowZero ? 0 : 1;

  if (!Number.isSafeInteger(number) || number < minimum || number > 1_000_000_000) {
    return null;
  }

  return number;
}

function titleValue(value: FormDataEntryValue | null, fallback: string) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, 120)
    : fallback;
}

function parseAdjustmentAmount(value: FormDataEntryValue | null) {
  if (value === null || (typeof value === "string" && !value.trim())) {
    return 1;
  }

  return parseWholeNumber(value);
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Error && error.message.includes("Unique constraint");
}

export async function createStockItemAction(
  _previousState: StockFormState,
  formData: FormData,
): Promise<StockFormState> {
  const session = await requireSession();
  const member = await requireMember();
  const nameValue = formData.get("name");
  const name = typeof nameValue === "string" ? nameValue.trim().slice(0, 100) : "";
  const quantity = parseWholeNumber(formData.get("quantity"), { allowZero: true });

  if (!name) {
    return { error: "Ürün adı zorunludur." };
  }

  if (quantity === null) {
    return { error: "Geçerli bir stok miktarı girin." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const item = await tx.stockItem.create({
        data: {
          name,
          quantity,
          userId: session.user.id,
        },
      });

      if (quantity > 0) {
        await tx.stockChange.create({
          data: {
            amount: quantity,
            title: titleValue(formData.get("title"), "İlk stok girişi"),
            createdByName: member.name,
            stockItemId: item.id,
            userId: session.user.id,
          },
        });
      }
    });
  } catch (error) {
    console.error("[createStockItemAction] Stock item creation failed", error);
    return {
      error: isUniqueConstraintError(error)
        ? "Bu ürün zaten stok listesinde var."
        : "Stok ürünü oluşturulamadı.",
    };
  }

  revalidatePath("/admin/stock");
  return { success: "Stok ürünü eklendi." };
}

export async function adjustStockAction(
  _previousState: StockFormState,
  formData: FormData,
): Promise<StockFormState> {
  const session = await requireSession();
  const member = await requireMember();
  const itemId = formData.get("itemId");
  const direction = formData.get("direction");
  const amount = parseAdjustmentAmount(formData.get("amount"));

  if (typeof itemId !== "string" || !itemId) {
    return { error: "Stok ürünü bulunamadı." };
  }

  if (direction !== "IN" && direction !== "OUT") {
    return { error: "Stok hareketi geçersiz." };
  }

  if (amount === null) {
    return { error: "Miktar en az 1 olan tam sayı olmalıdır." };
  }

  const result = await prisma.$transaction(async (tx) => {
    const item = await tx.stockItem.findFirst({
      where: { id: itemId, userId: session.user.id },
      select: { id: true, quantity: true },
    });

    if (!item) {
      return { error: "Stok ürünü bulunamadı." };
    }

    if (direction === "OUT" && item.quantity < amount) {
      return { error: `Stokta yalnızca ${item.quantity} adet var.` };
    }

    const signedAmount = direction === "IN" ? amount : -amount;
    const update = await tx.stockItem.updateMany({
      where: {
        id: item.id,
        userId: session.user.id,
        ...(direction === "OUT" ? { quantity: { gte: amount } } : {}),
      },
      data: { quantity: { increment: signedAmount } },
    });

    if (update.count !== 1) {
      return { error: "Stok değişikliği uygulanamadı. Tekrar deneyin." };
    }

    await tx.stockChange.create({
      data: {
        amount: signedAmount,
        title: titleValue(
          formData.get("title"),
          direction === "IN" ? "Stok girişi" : "Stok çıkışı",
        ),
        createdByName: member.name,
        stockItemId: item.id,
        userId: session.user.id,
      },
    });

    return { success: direction === "IN" ? "Stok artırıldı." : "Stok azaltıldı." };
  });

  if (result.error) {
    return result;
  }

  revalidatePath("/admin/stock");
  return result;
}
