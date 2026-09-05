"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireMember, requireSession } from "@/lib/auth-helpers";

export type LeadFormState = {
  error?: string;
  success?: string;
  leadId?: string;
  businessName?: string;
  shouldOpenIncome?: boolean;
};

const leadTypes = ["MESSAGE", "CALL", "MAIL", "ORDER"] as const;
const leadStages = [
  "REFUSED",
  "DECISION_MAKER_ABSENT",
  "STAFF_LIKED",
  "STAFF_EXPECTS_BOSS_INTEREST",
  "FOLLOW_UP_REQUESTED",
  "ORDER_INTENT",
  "ORDER_CONFIRMED",
] as const;

type LeadStageValue = (typeof leadStages)[number];

function parseDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "invalid" as const;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? "invalid" as const : date;
}

function textValue(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, maxLength) : null;
}

function parseWalkInFields(formData: FormData) {
  const businessName = textValue(formData.get("businessName"), 120);
  const stageValue = formData.get("stage");
  const contactInfo = textValue(formData.get("contactInfo"), 240);
  const details = textValue(formData.get("details"), 1000);
  const followUpAt = parseDate(formData.get("followUpAt"));
  const spokeToDecisionMaker = formData.get("spokeToDecisionMaker") === "yes";

  if (!businessName) return { error: "İşletme adı zorunludur." } as const;
  if (typeof stageValue !== "string" || !leadStages.includes(stageValue as LeadStageValue)) return { error: "Görüşme sonucunu seçin." } as const;
  if (followUpAt === "invalid") return { error: "Geçerli bir takip tarihi seçin." } as const;
  if (stageValue === "FOLLOW_UP_REQUESTED" && !followUpAt) return { error: "Tekrar gelme tarihini seçin." } as const;
  if (stageValue === "ORDER_INTENT" && !contactInfo) return { error: "Sipariş niyeti için iletişim bilgisi girin." } as const;

  return {
    value: {
      businessName,
      stage: stageValue as LeadStageValue,
      contactInfo,
      details,
      followUpAt: followUpAt as Date | null,
      spokeToDecisionMaker,
    },
  } as const;
}

export async function addWalkInAction(
  _previousState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const session = await requireSession();
  const member = await requireMember();
  const parsed = parseWalkInFields(formData);
  if ("error" in parsed) return { error: parsed.error };

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.lead.findFirst({
      where: {
        userId: session.user.id,
        source: "COLD_WALK_IN",
        personName: { equals: parsed.value.businessName, mode: "insensitive" },
      },
      select: { id: true },
    });
    const lead = existing
      ? await tx.lead.update({
          where: { id: existing.id },
          data: {
            stage: parsed.value.stage,
            contactInfo: parsed.value.contactInfo,
            followUpAt: parsed.value.followUpAt,
            details: parsed.value.details,
          },
          select: { id: true, personName: true },
        })
      : await tx.lead.create({
          data: {
            type: "CALL",
            source: "COLD_WALK_IN",
            stage: parsed.value.stage,
            personName: parsed.value.businessName,
            contactInfo: parsed.value.contactInfo,
            followUpAt: parsed.value.followUpAt,
            details: parsed.value.details,
            createdByMemberId: member.id,
            userId: session.user.id,
          },
          select: { id: true, personName: true },
        });

    await tx.leadVisit.create({
      data: {
        stage: parsed.value.stage,
        occurredAt: new Date(),
        spokeToDecisionMaker: parsed.value.spokeToDecisionMaker,
        followUpAt: parsed.value.followUpAt,
        contactInfo: parsed.value.contactInfo,
        details: parsed.value.details,
        leadId: lead.id,
        memberId: member.id,
        userId: session.user.id,
      },
    });
    return lead;
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return {
    success: "Ziyaret kaydedildi.",
    leadId: result.id,
    businessName: result.personName,
    shouldOpenIncome: parsed.value.stage === "ORDER_CONFIRMED",
  };
}

function parseLegacyLeadFields(formData: FormData) {
  const type = formData.get("leadType");
  const personName = textValue(formData.get("personName"), 120);
  const contactInfo = textValue(formData.get("contactInfo"), 240);
  const followUpAt = parseDate(formData.get("followUpAt"));
  const details = textValue(formData.get("details"), 1000);

  if (typeof type !== "string" || !leadTypes.includes(type as (typeof leadTypes)[number])) return { error: "Takip türünü seçin." } as const;
  if (!personName) return { error: "İşletme veya kişi adı zorunludur." } as const;
  if (followUpAt === "invalid") return { error: "Geçerli bir tarih seçin." } as const;

  return { value: { type: type as (typeof leadTypes)[number], personName, contactInfo, followUpAt: followUpAt as Date | null, details } } as const;
}

export async function addLeadAction(_previousState: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const session = await requireSession();
  const member = await requireMember();
  const parsed = parseLegacyLeadFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  await prisma.lead.create({ data: { ...parsed.value, createdByMemberId: member.id, userId: session.user.id } });
  revalidatePath("/admin/leads");
  return { success: "Takip eklendi." };
}

export async function updateLeadAction(_previousState: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const session = await requireSession();
  const id = formData.get("id");
  const parsed = parseLegacyLeadFields(formData);
  if (typeof id !== "string" || !id) return { error: "Takip bulunamadı." };
  if ("error" in parsed) return { error: parsed.error };
  const existingLead = await prisma.lead.findFirst({ where: { id, userId: session.user.id }, select: { id: true } });
  if (!existingLead) return { error: "Takip bulunamadı." };
  await prisma.lead.update({ where: { id: existingLead.id }, data: parsed.value });
  revalidatePath("/admin/leads");
  return { success: "Takip güncellendi." };
}

export async function deleteLeadAction(formData: FormData) {
  const session = await requireSession();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await prisma.lead.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
