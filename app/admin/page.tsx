import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { GoogleReviewAdminTool } from "@/components/google-review-admin-tool";
import { requireMember, requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { getPartnerMembers } from "@/lib/finance";

export const metadata: Metadata = { title: "Yorum bağlantısı ve saha | Yönetim", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const session = await requireSession();
  const currentMember = await requireMember();
  const [walkIns, legacyWalkIns, allMembers] = await Promise.all([
    prisma.lead.findMany({
      where: { userId: session.user.id, source: "COLD_WALK_IN", googlePlaceId: { not: null } },
      include: { createdByMember: { select: { name: true } }, participants: { include: { member: { select: { id: true, name: true } } } }, notes: { include: { member: { select: { name: true } } }, orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" }, take: 200,
    }),
    prisma.lead.findMany({ where: { userId: session.user.id, source: "COLD_WALK_IN", googlePlaceId: null }, select: { id: true, personName: true, details: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.member.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const members = getPartnerMembers(allMembers);
  return <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl">
    <AdminHeader eyebrow="Saha araçları" title="Yorum bağlantısı" description="Bağlantıyı oluştur, karta yaz ve sonucu tek ekrandan takip et."><AdminLogoutButton /></AdminHeader>
    <AdminNav active="reviews" />
    <GoogleReviewAdminTool members={members} currentMember={currentMember} legacyWalkIns={legacyWalkIns.map((lead) => ({ id: lead.id, name: lead.personName, details: lead.details, createdAt: lead.createdAt.toISOString() }))} initialWalkIns={walkIns.map((lead) => ({ id: lead.id, name: lead.personName, reviewUrl: lead.googleReviewUrl!, wasSold: lead.wasSold, createdAt: lead.createdAt.toISOString(), creatorName: lead.createdByMember?.name ?? "Bilinmiyor", participantIds: lead.participants.map((entry) => entry.member.id), participantNames: lead.participants.map((entry) => entry.member.name), notes: lead.notes.map((note) => ({ id: note.id, text: note.text, createdAt: note.createdAt.toISOString(), memberName: note.member.name })) }))} />
  </div></main>;
}
