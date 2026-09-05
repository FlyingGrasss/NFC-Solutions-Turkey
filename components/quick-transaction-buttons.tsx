"use client";

import { useEffect, useState } from "react";
import { addTransactionAction } from "@/app/actions";
import { TransactionForm } from "@/components/transaction-form";
import type { MemberOption } from "@/components/payer-picker";
import { modalBackdropClass, modalCardClass } from "@/lib/ui";

export function QuickTransactionButtons({
  members,
  currentMemberId,
  defaultDate,
}: {
  members: MemberOption[];
  currentMemberId: string;
  defaultDate: string;
}) {
  const [type, setType] = useState<"INCOME" | "EXPENSE" | null>(null);

  useEffect(() => {
    if (!type) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setType(null);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [type]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setType("INCOME")} className="rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700">+ Gelir</button>
        <button type="button" onClick={() => setType("EXPENSE")} className="rounded-xl bg-rose-600 px-3 py-2.5 text-xs font-black text-white transition hover:bg-rose-700">− Gider</button>
      </div>
      {type ? (
        <div className={`${modalBackdropClass} items-end sm:items-center`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setType(null); }}>
          <div className={`${modalCardClass} max-h-[calc(100vh-1rem)] max-w-lg sm:max-h-[calc(100vh-2rem)]`} role="dialog" aria-modal="true" aria-labelledby="quick-transaction-title">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-emerald-600">Hızlı kayıt</p>
                <h2 id="quick-transaction-title" className="mt-1 text-2xl font-black tracking-tight text-slate-950">{type === "INCOME" ? "Yeni gelir" : "Yeni gider"}</h2>
              </div>
              <button type="button" aria-label="Pencereyi kapat" onClick={() => setType(null)} className="rounded-xl px-3 py-1 text-2xl leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-700">×</button>
            </div>
            <TransactionForm
              defaultType={type}
              members={members}
              currentMemberId={currentMemberId}
              defaultPaidByMemberId={currentMemberId}
              defaultSoldByMemberId={currentMemberId}
              defaultDate={defaultDate}
              action={addTransactionAction}
              onSuccess={() => setType(null)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
