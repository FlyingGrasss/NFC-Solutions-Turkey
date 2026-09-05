"use client";

import { useState } from "react";
import { ComparisonSection } from "@/components/comparison-section";
import { DeleteTransactionButton } from "@/components/delete-transaction-button";
import { EditTransactionModal } from "@/components/edit-transaction-modal";
import { QuickTransactionButtons } from "@/components/quick-transaction-buttons";
import { SettlementButton, type SettlementSuggestion } from "@/components/settlement-button";
import type { MemberOption } from "@/components/payer-picker";
import { calculateFinance, getSettlementSuggestion, type FinanceTransaction } from "@/lib/finance";

type ClientTransaction = FinanceTransaction & {
  description: string;
  date: string;
  createdByName: string;
  paidByName: string | null;
  soldByName: string | null;
  leadId: string | null;
};

type ClientSettlement = {
  id: string;
  amountCents: number;
  date: string;
  note: string | null;
  createdByName: string;
  fromMember: { name: string };
  toMember: { name: string };
  fromMemberId: string;
  toMemberId: string;
};

const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });
const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });

function parseAmount(value: string) {
  const normalized = value.includes(",") ? value.replace(/\./g, "").replace(",", ".") : value;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : null;
}

export function AdminFinancePanel({
  initialTransactions,
  allTransactions,
  members,
  currentMemberId,
  currentMemberName,
  settlements,
  defaultDate,
}: {
  initialTransactions: ClientTransaction[];
  allTransactions: FinanceTransaction[];
  members: MemberOption[];
  currentMemberId: string;
  currentMemberName: string;
  settlements: ClientSettlement[];
  defaultDate: string;
}) {
  const [pendingTransactions, setPendingTransactions] = useState<ClientTransaction[]>([]);
  const serverHasPending = (pending: ClientTransaction) => initialTransactions.some((transaction) => transaction.amountCents === pending.amountCents && transaction.description === pending.description && transaction.date.slice(0, 10) === pending.date.slice(0, 10));
  const visiblePending = pendingTransactions.filter((transaction) => !serverHasPending(transaction));
  const displayTransactions = [...visiblePending, ...initialTransactions];
  const displayAllTransactions = [...visiblePending, ...allTransactions];
  const finance = calculateFinance(members, displayAllTransactions, settlements);
  const suggestion = getSettlementSuggestion(members, displayAllTransactions, settlements);
  const suggestionForButton: SettlementSuggestion | null = suggestion ? { ...suggestion, fromName: members.find((member) => member.id === suggestion.fromMemberId)?.name ?? "", toName: members.find((member) => member.id === suggestion.toMemberId)?.name ?? "" } : null;
  const incomeCount = displayTransactions.filter((transaction) => transaction.type === "INCOME").length;
  const expenseCount = displayTransactions.filter((transaction) => transaction.type === "EXPENSE").length;
  const comparisonRows = members.map((member) => ({ name: member.name, ...(finance.totals.get(member.id) ?? { soldSoloCents: 0, soldJointCents: 0, entitledIncomeCents: 0, sharedExpenseCents: 0, actualIncomeCents: 0, actualExpenseCents: 0, sentSettlementCents: 0, receivedSettlementCents: 0, actualNetCents: 0, settlementCents: 0 }) }));

  const handleBeforeSubmit = (formData: FormData) => {
    const amountValue = formData.get("amount");
    const amountCents = typeof amountValue === "string" ? parseAmount(amountValue.trim()) : null;
    const type = formData.get("type");
    if (!amountCents || (type !== "INCOME" && type !== "EXPENSE")) return;
    const dateValue = formData.get("date");
    const date = typeof dateValue === "string" && dateValue ? `${dateValue}T12:00:00.000Z` : `${defaultDate}T12:00:00.000Z`;
    const pending: ClientTransaction = {
      id: `optimistic-${crypto.randomUUID()}`,
      type,
      amountCents,
      description: typeof formData.get("description") === "string" && String(formData.get("description")).trim() ? String(formData.get("description")).trim() : "Açıklama yok",
      date,
      createdByName: currentMemberName,
      paidByMemberId: formData.get("paidByMemberId") && formData.get("paidByMemberId") !== "SPLIT" ? String(formData.get("paidByMemberId")) : null,
      paidByName: formData.get("paidByMemberId") && formData.get("paidByMemberId") !== "SPLIT" ? members.find((member) => member.id === String(formData.get("paidByMemberId")))?.name ?? null : null,
      saleMode: type === "INCOME" && formData.get("saleMode") === "JOINT" ? "JOINT" : type === "INCOME" && formData.get("saleMode") === "SOLO" ? "SOLO" : "UNASSIGNED",
      soldByMemberId: type === "INCOME" && typeof formData.get("soldByMemberId") === "string" && String(formData.get("soldByMemberId")).trim() ? String(formData.get("soldByMemberId")) : null,
      soldByName: type === "INCOME" && typeof formData.get("soldByMemberId") === "string" ? members.find((member) => member.id === String(formData.get("soldByMemberId")))?.name ?? null : null,
      leadId: null,
    };
    setPendingTransactions((current) => [pending, ...current]);
    return pending.id;
  };

  const handleActionError = (optimisticId?: string) => {
    if (optimisticId) setPendingTransactions((current) => current.filter((transaction) => transaction.id !== optimisticId));
  };

  return (
    <>
      <div className="mb-4 flex justify-end"><QuickTransactionButtons members={members} currentMemberId={currentMemberId} defaultDate={defaultDate} onBeforeSubmit={handleBeforeSubmit} onActionError={handleActionError} /></div>
      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="min-h-42 rounded-3xl border border-slate-900 bg-slate-900 p-5 text-white shadow-[0_12px_38px_rgb(25_55_36_/_0.08)]"><p className="text-xs font-extrabold uppercase tracking-wide text-white/60">Bakiye</p><p className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-black tracking-[-0.04em]">{currency.format(finance.balanceCents / 100)}</p><p className="mt-4 text-xs text-white/60">Gelirlerden giderler çıkarıldı</p></div>
        <div className="min-h-42 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_38px_rgb(25_55_36_/_0.05)]"><p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Toplam gelir</p><p className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-black tracking-[-0.04em] text-emerald-700">{currency.format(finance.incomeCents / 100)}</p><p className="mt-4 text-xs text-slate-400">{incomeCount} gelir kaydı</p></div>
        <div className="min-h-42 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_38px_rgb(25_55_36_/_0.05)]"><p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Toplam gider</p><p className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-black tracking-[-0.04em] text-rose-600">{currency.format(finance.expenseCents / 100)}</p><p className="mt-4 text-xs text-slate-400">{expenseCount} gider kaydı</p></div>
      </section>
      <ComparisonSection rows={comparisonRows} totalSpentCents={finance.expenseCents} totalReceivedCents={finance.incomeCents} action={<SettlementButton suggestion={suggestionForButton} />} />
      <section className="mt-6"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-emerald-600">Son hareketler</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Kayıtlar</h2></div><span className="text-xs font-medium text-slate-400">En yeni 100</span></div>{displayTransactions.length === 0 ? <div className="rounded-3xl bg-white/90 px-5 py-12 text-center text-sm text-slate-500">Henüz kayıt yok.</div> : <ul className="divide-y divide-slate-100 rounded-3xl border border-slate-200/80 bg-white/90 px-5 shadow-[0_12px_38px_rgb(25_55_36_/_0.05)] sm:px-6">{displayTransactions.map((transaction) => { const isIncome = transaction.type === "INCOME"; const isOptimistic = transaction.id.startsWith("optimistic-"); const saleText = !isIncome ? null : transaction.saleMode === "SOLO" ? `Satışı: ${transaction.soldByName ?? members.find((member) => member.id === transaction.soldByMemberId)?.name ?? "Satıcı seçilmedi"}` : transaction.saleMode === "JOINT" ? "Birlikte satıldı" : "Satıcı seçilmedi"; return <li key={transaction.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 max-sm:grid max-sm:grid-cols-[2.25rem_minmax(0,1fr)] max-sm:items-start"><div className={isIncome ? "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-green-100 text-lg font-black text-green-700" : "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-100 text-lg font-black text-rose-600"}>{isIncome ? "↑" : "↓"}</div><div className="min-w-0 flex-1"><p className="break-words text-sm font-bold text-slate-800">{transaction.description}</p><div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400"><time dateTime={transaction.date}>{dateFormatter.format(new Date(transaction.date))}</time><span aria-hidden="true">·</span><span>Ekleyen: {transaction.createdByName}</span><span aria-hidden="true">·</span>{saleText ? <><span>{saleText}</span><span aria-hidden="true">·</span></> : null}<span>{transaction.paidByName ? `${transaction.paidByName} ${isIncome ? "aldı" : "ödedi"}` : "Bölüşüldü"}</span>{isOptimistic ? <><span aria-hidden="true">·</span><span className="font-bold text-amber-600">Kaydediliyor…</span></> : null}</div></div><div className="flex shrink-0 items-center gap-3 max-sm:col-start-2 max-sm:mt-2 max-sm:w-full max-sm:justify-between"><p className={isIncome ? "text-right text-sm font-black text-emerald-700" : "text-right text-sm font-black text-rose-600"}>{isIncome ? "+" : "−"}{currency.format(transaction.amountCents / 100)}</p>{isOptimistic ? null : <><EditTransactionModal transaction={{ id: transaction.id, type: transaction.type, amountCents: transaction.amountCents, description: transaction.description, date: transaction.date.slice(0, 10), paidByMemberId: transaction.paidByMemberId, saleMode: transaction.saleMode, soldByMemberId: transaction.soldByMemberId, leadId: transaction.leadId }} members={members} /><DeleteTransactionButton id={transaction.id} description={transaction.description} /></>}</div></li>; })}</ul>}</section>
      <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_38px_rgb(25_55_36_/_0.05)] sm:p-6"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-emerald-600">Eşitleme geçmişi</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Transferler</h2></div><span className="text-xs font-medium text-slate-400">En yeni 50</span></div>{settlements.length === 0 ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">Henüz eşitleme transferi yok.</p> : <ul className="divide-y divide-slate-100">{settlements.map((settlement) => <li key={settlement.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-bold text-slate-800">{settlement.fromMember.name} → {settlement.toMember.name}</p><p className="mt-1 text-xs text-slate-400">{dateFormatter.format(new Date(settlement.date))} · Ekleyen: {settlement.createdByName}{settlement.note ? ` · ${settlement.note}` : ""}</p></div><p className="text-sm font-black text-emerald-700">{currency.format(settlement.amountCents / 100)}</p></li>)}</ul>}</section>
    </>
  );
}
