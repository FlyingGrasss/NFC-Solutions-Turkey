"use client";

import { useActionState, useState } from "react";
import { createSettlementAction, type FormState } from "@/app/actions";
import { eyebrowClass, modalBackdropClass, modalCardClass } from "@/lib/ui";

const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

export type SettlementSuggestion = {
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
  fromName: string;
  toName: string;
};

export function SettlementButton({ suggestion }: { suggestion: SettlementSuggestion | null }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(createSettlementAction, {});

  if (!suggestion) {
    return <span className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-400">Eşit durumdasınız</span>;
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100">
        Eşitle · {currency.format(suggestion.amountCents / 100)}
      </button>
      {open ? (
        <div className={modalBackdropClass} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) setOpen(false); }}>
          <div className={`${modalCardClass} max-w-md`} role="dialog" aria-modal="true" aria-labelledby="settlement-title">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className={`${eyebrowClass} text-emerald-600`}>Eşitleme</p>
                <h2 id="settlement-title" className="mt-1 text-2xl font-black tracking-tight text-slate-950">Transferi kaydet</h2>
              </div>
              <button type="button" aria-label="Pencereyi kapat" onClick={() => setOpen(false)} disabled={pending} className="rounded-xl px-3 py-1 text-2xl leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-700">×</button>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-center">
              <p className="text-sm font-semibold text-slate-500">{suggestion.fromName}, {suggestion.toName}’a</p>
              <p className="mt-1 text-3xl font-black text-emerald-700">{currency.format(suggestion.amountCents / 100)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">verecek</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">Bu transfer kaydedildikten sonra iki tarafın açık hesabı sıfırlanır. Gelir kayıtları ve satış istatistikleri değişmez.</p>
            <form action={formAction} className="mt-6 space-y-4">
              <input type="hidden" name="confirm" value="yes" />
              <input name="note" maxLength={120} placeholder="Not (opsiyonel)" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
              {state.error ? <p role="alert" className="text-sm font-semibold text-rose-600">{state.error}</p> : null}
              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} disabled={pending} className="flex-1 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50">Vazgeç</button>
                <button type="submit" disabled={pending} className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60">{pending ? "Kaydediliyor…" : "Evet, eşitle"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
