import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { ColdWalkInHistory } from "@/components/cold-walk-in-history";
import { requireMember, requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Cold walk-in geçmişi | Yönetim", robots: { index: false, follow: false } };

export default async function WalkInsPage() {
  const session = await requireSession();
  const [walkIns, members] = await Promise.all([
    prisma.lead.findMany({ where: { userId: session.user.id, source: "COLD_WALK_IN" }, include: { participants: { include: { member: { select: { id: true, name: true } } } }, notes: { include: { member: { select: { name: true } } }, orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" }, take: 300 }),
    prisma.member.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, role: true } }),
  ]);
  await requireMember();

  return <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><AdminHeader eyebrow="Saha araçları" title="Cold walk-in geçmişi" description="Eski saha kayıtlarını, sonuçlarını ve notlarını yönet."><AdminLogoutButton /></AdminHeader><AdminNav active="walkIns" /><ColdWalkInHistory initialWalkIns={walkIns.map((lead) => ({ id: lead.id, name: lead.personName, wasSold: lead.wasSold, createdAt: lead.createdAt.toISOString(), participantIds: lead.participants.map((entry) => entry.member.id), participantNames: lead.participants.map((entry) => entry.member.name), notes: lead.notes.map((note) => ({ id: note.id, text: note.text, createdAt: note.createdAt.toISOString(), memberName: note.member.name })) }))} members={members} /></div></main>;
}
