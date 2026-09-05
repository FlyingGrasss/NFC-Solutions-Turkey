import type { Metadata } from "next";
import { AdminNav } from "@/components/admin-nav";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { ComparisonSection } from "@/components/comparison-section";
import { DeleteTransactionButton } from "@/components/delete-transaction-button";
import { EditTransactionModal } from "@/components/edit-transaction-modal";
import { GoogleReviewAdminTool } from "@/components/google-review-admin-tool";
import { AdminHeader } from "@/components/admin-header";
import { QuickTransactionButtons } from "@/components/quick-transaction-buttons";
import { SettlementButton } from "@/components/settlement-button";
import { requireMember, requireSession } from "@/lib/auth-helpers";
import { calculateFinance, getPartnerMembers, getSettlementSuggestion } from "@/lib/finance";
import { prisma } from "@/lib/db";
import { emptyStateClass, eyebrowClass, panelClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Özet | Gelir Gider",
  robots: { index: false, follow: false },
};

const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });
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
      include: { paidByMember: { select: { name: true } }, soldByMember: { select: { name: true } }, lead: { select: { id: true, personName: true } } },
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
  const finance = calculateFinance(members, allTransactions, settlements);
  const suggestion = getSettlementSuggestion(members, allTransactions, settlements);
  const suggestionForButton = suggestion ? { ...suggestion, fromName: members.find((member) => member.id === suggestion.fromMemberId)?.name ?? "", toName: members.find((member) => member.id === suggestion.toMemberId)?.name ?? "" } : null;
  const incomeCount = transactions.filter((item) => item.type === "INCOME").length;
  const expenseCount = transactions.filter((item) => item.type === "EXPENSE").length;
  const comparisonRows = members.map((member) => ({ name: member.name, ...(finance.totals.get(member.id) ?? { soldSoloCents: 0, soldJointCents: 0, entitledIncomeCents: 0, sharedExpenseCents: 0, actualIncomeCents: 0, actualExpenseCents: 0, sentSettlementCents: 0, receivedSettlementCents: 0, actualNetCents: 0, settlementCents: 0 }) }));

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <AdminHeader eyebrow="Yönetim" title="Gelir Gider" description="Gelir, gider ve takiplerini tek yerde yönet.">
          <QuickTransactionButtons members={members} currentMemberId={currentMember.id} defaultDate={todayInIstanbul()} />
          <div className="order-1 sm:order-2"><AdminLogoutButton /></div>
          <p className="order-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:order-1">{transactions.length} kayıt</p>
        </AdminHeader>

        <AdminNav active="overview" />

        <section className={`${panelClass} mt-6`}><GoogleReviewAdminTool /></section>

        <section className="mb-8 mt-6 grid gap-4 sm:grid-cols-3">
          <div className="min-h-42 rounded-3xl border border-slate-900 bg-slate-900 p-5 text-white shadow-[0_12px_38px_rgb(25_55_36_/_0.08)]"><p className="text-xs font-extrabold uppercase tracking-wide text-white/60">Bakiye</p><p className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-black tracking-[-0.04em]">{currency.format(finance.balanceCents / 100)}</p><p className="mt-4 text-xs text-white/60">Gelirlerden giderler çıkarıldı</p></div>
          <div className="min-h-42 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_38px_rgb(25_55_36_/_0.05)]"><p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Toplam gelir</p><p className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-black tracking-[-0.04em] text-emerald-700">{currency.format(finance.incomeCents / 100)}</p><p className="mt-4 text-xs text-slate-400">{incomeCount} gelir kaydı</p></div>
          <div className="min-h-42 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_38px_rgb(25_55_36_/_0.05)]"><p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Toplam gider</p><p className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-black tracking-[-0.04em] text-rose-600">{currency.format(finance.expenseCents / 100)}</p><p className="mt-4 text-xs text-slate-400">{expenseCount} gider kaydı</p></div>
        </section>

        <ComparisonSection rows={comparisonRows} totalSpentCents={finance.expenseCents} totalReceivedCents={finance.incomeCents} action={<SettlementButton suggestion={suggestionForButton} />} />

        <section className={`${panelClass} mb-8 mt-6`}>
          <div className="mb-5 flex items-end justify-between gap-4"><div><p className={eyebrowClass}>Eşitleme geçmişi</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Transferler</h2></div><span className="text-xs font-medium text-slate-400">En yeni 50</span></div>
          {settlements.length === 0 ? <div className="rounded-2xl bg-slate-50 px-5 py-6 text-sm text-slate-500">Henüz eşitleme transferi yok.</div> : <ul className="divide-y divide-slate-100">{settlements.map((settlement) => <li key={settlement.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-bold text-slate-800">{settlement.fromMember.name} → {settlement.toMember.name}</p><p className="mt-1 text-xs text-slate-400">{dateFormatter.format(settlement.date)} · Ekleyen: {settlement.createdByName}{settlement.note ? ` · ${settlement.note}` : ""}</p></div><p className="text-sm font-black text-emerald-700">{currency.format(settlement.amountCents / 100)}</p></li>)}</ul>}
        </section>

        <section className={`${panelClass} mb-8 mt-6`}>
          <div className="mb-5 flex items-end justify-between gap-4"><div><p className={eyebrowClass}>Ana sayfadan gelenler</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">İletişim mesajları</h2></div><span className="text-xs font-medium text-slate-400">En yeni 100</span></div>
          {contactMessages.length === 0 ? <div className="flex min-h-0 flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 py-12 text-center"><p className="font-bold text-slate-700">Henüz iletişim mesajı yok</p><p className="mt-1 text-sm text-slate-400">Ana sayfadaki formdan gelen mesajlar burada görünecek.</p></div> : <div className="grid gap-3">{contactMessages.map((contactMessage) => <article key={contactMessage.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black text-slate-900">{contactMessage.name}</h3><p className="mt-1 text-sm font-semibold text-emerald-700">{contactMessage.contact}</p></div><time className="text-xs text-slate-400" dateTime={contactMessage.createdAt.toISOString()}>{dateFormatter.format(contactMessage.createdAt)}</time></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{contactMessage.message}</p></article>)}</div>}
        </section>

        <section className={`${panelClass} mb-8 mt-6`}>
          <div className="mb-5 flex items-end justify-between gap-4"><div><p className={eyebrowClass}>Son hareketler</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Kayıtlar</h2></div><span className="text-xs font-medium text-slate-400">En yeni 100</span></div>
          {transactions.length === 0 ? <div className={emptyStateClass}><p className="font-bold text-slate-700">Henüz kayıt yok</p><p className="mt-1 text-sm text-slate-400">Yukarıdaki hızlı kayıt tuşlarından ilk hareketini ekleyebilirsin.</p></div> : <ul className="divide-y divide-slate-100">{transactions.map((transaction) => { const isIncome = transaction.type === "INCOME"; const saleText = !isIncome ? null : transaction.saleMode === "SOLO" ? `Satışı: ${transaction.soldByMember?.name ?? "Satıcı seçilmedi"}` : transaction.saleMode === "JOINT" ? "Birlikte satıldı" : "Satıcı seçilmedi"; return <li key={transaction.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 max-sm:grid max-sm:grid-cols-[2.25rem_minmax(0,1fr)] max-sm:items-start"><div className={isIncome ? "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-green-100 text-lg font-black text-green-700" : "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-100 text-lg font-black text-rose-600"}>{isIncome ? "↑" : "↓"}</div><div className="min-w-0 flex-1"><p className="transaction-description break-words text-sm font-bold text-slate-800" title={transaction.description}>{transaction.description}</p><div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400"><time dateTime={transaction.date.toISOString()}>{dateFormatter.format(transaction.date)}</time><span aria-hidden="true">·</span><span>Ekleyen: {transaction.createdByName}</span><span aria-hidden="true">·</span>{saleText ? <span>{saleText}</span> : null}{saleText ? <span aria-hidden="true">·</span> : null}<span>{transaction.paidByMember ? `${transaction.paidByMember.name} ${isIncome ? "aldı" : "ödedi"}` : "Bölüşüldü"}</span></div></div><div className="flex shrink-0 items-center gap-3 max-sm:col-start-2 max-sm:mt-2 max-sm:w-full max-sm:justify-between"><p className={isIncome ? "text-right text-sm font-black text-emerald-700" : "text-right text-sm font-black text-rose-600"}>{isIncome ? "+" : "−"}{currency.format(transaction.amountCents / 100)}</p><EditTransactionModal transaction={{ id: transaction.id, type: transaction.type, amountCents: transaction.amountCents, description: transaction.description, date: transaction.date.toISOString().slice(0, 10), paidByMemberId: transaction.paidByMemberId, saleMode: transaction.saleMode, soldByMemberId: transaction.soldByMemberId, leadId: transaction.leadId }} members={members} /><DeleteTransactionButton id={transaction.id} description={transaction.description} /></div></li>; })}</ul>}
        </section>
      </div>
    </main>
  );
}
