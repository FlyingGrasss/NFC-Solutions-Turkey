"use client";

import { useActionState, useState } from "react";
import { splitAllTransactionsAction, type FormState } from "@/app/actions";
import { eyebrowClass, modalBackdropClass, modalCardClass } from "@/lib/ui";

export function SplitAllTransactionsButton({ transactionCount }: { transactionCount: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async () => {
      const result = await splitAllTransactionsAction();
      if (result.success) setOpen(false);
      return result;
    },
    {},
  );

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={transactionCount === 0}
          className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Eşitle: tümünü Bölüşüldü yap
        </button>

        {state.error ? <p role="alert" className="text-right text-xs font-semibold text-rose-600">{state.error}</p> : null}
      </div>

      {open ? (
        <div
          className={modalBackdropClass}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !pending) setOpen(false);
          }}
        >
          <div
            className={`${modalCardClass} max-w-md`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="split-all-transactions-title"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className={`${eyebrowClass} text-emerald-600`}>Gelir gider eşitleme</p>
                <h2 id="split-all-transactions-title" className="mt-1 text-xl font-black tracking-tight text-slate-950">
                  Tüm kayıtlar bölüşülsün mü?
                </h2>
              </div>
              <button
                type="button"
                aria-label="Pencereyi kapat"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-xl px-3 py-1 text-2xl leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <p className="text-sm leading-6 text-slate-500">
              {transactionCount} gelir ve gider kaydının tamamında kişi bilgisini kaldırıp kaydı <span className="font-bold text-slate-800">Bölüşüldü</span> olarak işaretleyeceksin. Karşılaştırma bundan sonra tüm kayıtları eşit paylaşılmış kabul edecek.
            </p>

            <form action={formAction} className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="flex-1 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {pending ? "Eşitleniyor…" : "Evet, eşitle"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
