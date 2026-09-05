import type { ReactNode } from "react";
import { emptyStateClass, eyebrowClass, panelClass } from "@/lib/ui";

type ComparisonRow = {
  name: string;
  soldSoloCents: number;
  soldJointCents: number;
  entitledIncomeCents: number;
  sharedExpenseCents: number;
  actualIncomeCents: number;
  actualExpenseCents: number;
  actualNetCents: number;
  settlementCents: number;
};

const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

function formatCurrency(cents: number) {
  return currency.format(cents / 100);
}

export function ComparisonSection({
  rows,
  totalSpentCents,
  totalReceivedCents,
  action,
}: {
  rows: ComparisonRow[];
  totalSpentCents: number;
  totalReceivedCents: number;
  action?: ReactNode;
}) {
  return (
    <section className={`${panelClass} mt-6`}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={eyebrowClass}>Kişisel satış ve eşitleme</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Kim ne kadar sattı, kim ne kadar almalı?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Solo satışlar 2:1, birlikte yapılan satışlar 1:1 hesaplanır. Alınan para ve eşitleme transferleri satış geçmişini değiştirmez.</p>
        </div>
        {action}
      </div>

      {rows.length === 0 ? (
        <div className={`${emptyStateClass} min-h-0 px-4 py-10`}>
          <p className="font-bold text-slate-700">Karşılaştırılacak kişi yok</p>
          <p className="mt-1 text-sm text-slate-400">Emre ve Başar üyeleriyle giriş yaptığınızda hesap burada görünür.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((row) => {
            const needsToReceive = row.settlementCents < -0.5;
            const needsToGive = row.settlementCents > 0.5;
            return (
              <article key={row.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-black text-slate-900">{row.name}</h3>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.65rem] font-black text-emerald-700">Satış sahibi</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Solo sattı</p>
                    <p className="mt-1 text-lg font-black text-emerald-700">{formatCurrency(row.soldSoloCents)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Ortak payı</p>
                    <p className="mt-1 text-lg font-black text-emerald-700">{formatCurrency(row.soldJointCents)}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Hak ediş</p>
                    <p className="mt-1 text-sm font-black text-slate-700">{formatCurrency(row.entitledIncomeCents - row.sharedExpenseCents)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Fiilî net</p>
                    <p className="mt-1 text-sm font-black text-slate-700">{formatCurrency(row.actualNetCents)}</p>
                  </div>
                </div>
                <p className={`mt-3 text-sm font-bold ${needsToReceive ? "text-emerald-700" : needsToGive ? "text-amber-700" : "text-slate-500"}`}>
                  {needsToReceive ? `${formatCurrency(Math.abs(row.settlementCents))} almalı` : needsToGive ? `${formatCurrency(row.settlementCents)} vermeli` : "Eşit durumda"}
                </p>
                <p className="mt-2 text-xs text-slate-400">Gerçekte aldığı: {formatCurrency(row.actualIncomeCents)} · ödediği: {formatCurrency(row.actualExpenseCents)}</p>
              </article>
            );
          })}
        </div>
      )}
      <p className="mt-5 text-xs font-semibold text-slate-400">Toplam: {formatCurrency(totalReceivedCents)} gelir · {formatCurrency(totalSpentCents)} gider</p>
    </section>
  );
}
