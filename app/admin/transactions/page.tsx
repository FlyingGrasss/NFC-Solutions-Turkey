import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { TransactionsPanel } from "@/components/admin-finance-panel";
import { requireMember, requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { getPartnerMembers } from "@/lib/finance";

export const metadata: Metadata = { title: "Gelir Gider | Yönetim", robots: { index: false, follow: false } };
function today() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
export default async function TransactionsPage() {
  const session = await requireSession(); const currentMember = await requireMember();
  const [transactions, allMembers] = await Promise.all([
    prisma.transaction.findMany({ where: { userId: session.user.id }, include: { paidByMember: { select: { name: true } }, soldByMember: { select: { name: true } }, sellerCredits: { include: { member: { select: { name: true } } } } }, orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 100 }),
    prisma.member.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const members = getPartnerMembers(allMembers);
  return <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><AdminHeader eyebrow="Kasa hareketleri" title="Gelir Gider" description="Gelir ve giderleri ekle, düzenle ve geçmişi incele."><AdminLogoutButton /></AdminHeader><AdminNav active="transactions" /><TransactionsPanel initialTransactions={transactions.map((item) => ({ id: item.id, type: item.type, amountCents: item.amountCents, description: item.description, date: item.date.toISOString(), createdByName: item.createdByName, createdByMemberId: item.createdByMemberId, paidByMemberId: item.paidByMemberId, paidByName: item.paidByMember?.name ?? null, saleMode: item.saleMode, soldByMemberId: item.soldByMemberId, soldByName: item.soldByMember?.name ?? null, leadId: item.leadId, sellerCredits: item.sellerCredits.map((credit) => ({ memberId: credit.memberId, name: credit.member.name })) }))} members={members} currentMemberId={currentMember.id} currentMemberName={currentMember.name} defaultDate={today()} /></div></main>;
}
