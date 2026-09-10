"use server";

import { revalidatePath } from "next/cache";
import { requireMember, requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

async function ownedColdWalkIn(id: FormDataEntryValue | null, userId: string) {
  if (typeof id !== "string" || !id) return null;
  return prisma.lead.findFirst({ where: { id, userId, source: "COLD_WALK_IN" }, select: { id: true } });
}

export async function addColdWalkInNoteAction(formData: FormData) {
  const session = await requireSession(); const member = await requireMember();
  const lead = await ownedColdWalkIn(formData.get("leadId"), session.user.id);
  const value = formData.get("text"); const note = typeof value === "string" ? value.trim().slice(0, 1000) : "";
  if (!lead || !note) return { error: "Not eklenemedi." };
  const created = await prisma.leadNote.create({ data: { text: note, leadId: lead.id, memberId: member.id, userId: session.user.id }, include: { member: { select: { name: true } } } });
  revalidatePath("/admin");
  return { note: { id: created.id, text: created.text, createdAt: created.createdAt.toISOString(), memberName: created.member.name } };
}

export async function setColdWalkInOutcomeAction(formData: FormData) {
  const session = await requireSession(); const lead = await ownedColdWalkIn(formData.get("leadId"), session.user.id);
  if (!lead) return { error: "İşletme bulunamadı." };
  const wasSold = formData.get("wasSold") === "true";
  await prisma.lead.update({ where: { id: lead.id }, data: { wasSold } }); revalidatePath("/admin");
  return { success: true, wasSold };
}

export async function renameColdWalkInAction(formData: FormData) {
  const session = await requireSession(); const lead = await ownedColdWalkIn(formData.get("leadId"), session.user.id);
  const value = formData.get("name"); const name = typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 120) : "";
  if (!lead || !name) return { error: "Geçerli bir işletme adı girin." };
  await prisma.lead.update({ where: { id: lead.id }, data: { personName: name } }); revalidatePath("/admin");
  return { success: true, name };
}

export async function setColdWalkInOwnerAction(formData: FormData) {
  const session = await requireSession();
  await requireMember();
  const lead = await ownedColdWalkIn(formData.get("leadId"), session.user.id);
  const value = formData.get("owner");
  if (!lead || typeof value !== "string" || !value) return { error: "Saha sahibi seçilemedi." };
  const members = await prisma.member.findMany({ select: { id: true, name: true } });
  const ids = value === "JOINT"
    ? ["Emre", "Başar"].map((name) => members.find((member) => member.name === name)?.id).filter((id): id is string => Boolean(id))
    : members.some((member) => member.id === value) ? [value] : [];
  if (!ids.length) return { error: "Saha sahibi seçilemedi." };
  await prisma.$transaction([
    prisma.leadParticipant.deleteMany({ where: { leadId: lead.id } }),
    prisma.leadParticipant.createMany({ data: ids.map((memberId) => ({ leadId: lead.id, memberId })) }),
  ]);
  revalidatePath("/admin"); revalidatePath("/admin/finance");
  return { success: true, ids };
}
