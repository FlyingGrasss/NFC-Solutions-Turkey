import type { Metadata } from "next";
import { AdminFinancePanel } from "@/components/admin-finance-panel";
import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { GoogleReviewAdminTool } from "@/components/google-review-admin-tool";
import { getPartnerMembers } from "@/lib/finance";
import { requireMember, requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { eyebrowClass, panelClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Özet | Gelir Gider",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });

function todayInIstanbul() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export default async function AdminPage() {
  const session = await requireSession();
  const currentMember = await requireMember();
  const [transactions, allTransactions, allMembers, settlements, contactMessages] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { paidByMember: { select: { name: true } }, soldByMember: { select: { name: true } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      select: { id: true, type: true, amountCents: true, paidByMemberId: true, saleMode: true, soldByMemberId: true },
    }),
    prisma.member.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.settlement.findMany({
      where: { userId: session.user.id },
      include: { fromMember: { select: { name: true } }, toMember: { select: { name: true } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 50,
    }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  const members = getPartnerMembers(allMembers);

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <AdminHeader eyebrow="Yönetim" title="Gelir Gider" description="Gelir, gider ve takiplerini tek yerde yönet.">
          <div className="order-1 sm:order-2"><AdminLogoutButton /></div>
          <p className="order-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:order-1">{transactions.length} kayıt</p>
        </AdminHeader>
        <AdminNav active="overview" />
        <AdminFinancePanel
          initialTransactions={transactions.map((transaction) => ({ id: transaction.id, type: transaction.type, amountCents: transaction.amountCents, description: transaction.description, date: transaction.date.toISOString(), createdByName: transaction.createdByName, paidByMemberId: transaction.paidByMemberId, paidByName: transaction.paidByMember?.name ?? null, saleMode: transaction.saleMode, soldByMemberId: transaction.soldByMemberId, soldByName: transaction.soldByMember?.name ?? null, leadId: transaction.leadId }))}
          allTransactions={allTransactions}
          members={members}
          currentMemberId={currentMember.id}
          currentMemberName={currentMember.name}
          settlements={settlements.map((settlement) => ({ id: settlement.id, amountCents: settlement.amountCents, date: settlement.date.toISOString(), note: settlement.note, createdByName: settlement.createdByName, fromMember: settlement.fromMember, toMember: settlement.toMember, fromMemberId: settlement.fromMemberId, toMemberId: settlement.toMemberId }))}
          defaultDate={todayInIstanbul()}
        />
        <section className={`${panelClass} mt-6`}><GoogleReviewAdminTool /></section>
        <section className={`${panelClass} mb-8 mt-6`}>
          <div className="mb-5 flex items-end justify-between gap-4"><div><p className={eyebrowClass}>Ana sayfadan gelenler</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">İletişim mesajları</h2></div><span className="text-xs font-medium text-slate-400">En yeni 100</span></div>
          {contactMessages.length === 0 ? <div className="rounded-2xl bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">Henüz iletişim mesajı yok.</div> : <div className="grid gap-3">{contactMessages.map((contactMessage) => <article key={contactMessage.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black text-slate-900">{contactMessage.name}</h3><p className="mt-1 text-sm font-semibold text-emerald-700">{contactMessage.contact}</p></div><time className="text-xs text-slate-400" dateTime={contactMessage.createdAt.toISOString()}>{dateFormatter.format(contactMessage.createdAt)}</time></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{contactMessage.message}</p></article>)}</div>}
        </section>
      </div>
    </main>
  );
}
