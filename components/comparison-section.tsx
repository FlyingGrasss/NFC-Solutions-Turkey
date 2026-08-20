import type { ReactNode } from "react";
import { emptyStateClass, eyebrowClass, panelClass } from "@/lib/ui";

type ComparisonRow = {
  name: string;
  spentCents: number;
  receivedCents: number;
  netCents: number;
  settlementCents: number;
};

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

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
          <p className={eyebrowClass}>Karşılaştırma</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Kim ne kadar aldı, kim ne kadar harcadı?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            “Bölüşüldü” kayıtları üyeler arasında eşit paylaşılır. Eşitlik hesabı, alınan para eksi harcanan para üzerinden yapılır.
          </p>
        </div>
        {action}
      </div>

      {rows.length === 0 ? (
        <div className={`${emptyStateClass} min-h-0 px-4 py-10`}>
          <p className="font-bold text-slate-700">Karşılaştırılacak kayıt yok</p>
          <p className="mt-1 text-sm text-slate-400">İlk gelir veya gider kaydını eklediğinde burada görünecek.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((row) => {
            const needsToReceive = row.settlementCents < -0.5;
            const needsToGive = row.settlementCents > 0.5;

            return (
              <article key={row.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-base font-black text-slate-900">{row.name}</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Harcadı</p>
                    <p className="mt-1 text-lg font-black text-rose-600">{formatCurrency(row.spentCents)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Aldı</p>
                    <p className="mt-1 text-lg font-black text-emerald-700">{formatCurrency(row.receivedCents)}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Net (aldı − harcadı)</p>
                  <p className="mt-1 text-sm font-black text-slate-700">{formatCurrency(row.netCents)}</p>
                  <p className={`mt-2 text-sm font-bold ${needsToReceive ? "text-emerald-700" : needsToGive ? "text-amber-700" : "text-slate-500"}`}>
                    {needsToReceive
                      ? `${formatCurrency(Math.abs(row.settlementCents))} almalı`
                      : needsToGive
                        ? `${formatCurrency(row.settlementCents)} vermeli`
                        : "Eşit durumda"}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-5 text-xs font-semibold text-slate-400">
        Toplam: {formatCurrency(totalReceivedCents)} gelir · {formatCurrency(totalSpentCents)} gider
      </p>
    </section>
  );
}
