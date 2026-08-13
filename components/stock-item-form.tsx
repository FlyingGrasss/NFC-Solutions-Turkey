"use client";

import { useActionState } from "react";
import { adjustStockAction, type StockFormState } from "@/app/stock-actions";
import { fieldInputClass, fieldLabelClass } from "@/lib/ui";

const initialState: StockFormState = {};

export function StockAdjustmentForm({
  itemId,
  itemName,
}: {
  itemId: string;
  itemName: string;
}) {
  const [state, formAction, pending] = useActionState(adjustStockAction, initialState);

  return (
    <form action={formAction} className="mt-5 border-t border-slate-100 pt-5">
      <input type="hidden" name="itemId" value={itemId} />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <label htmlFor={`stock-amount-${itemId}`} className={fieldLabelClass}>
            Miktar <span className="font-normal text-slate-400">(boşsa 1)</span>
          </label>
          <input
            id={`stock-amount-${itemId}`}
            name="amount"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="1"
            className={fieldInputClass}
          />
        </div>
        <div>
          <label htmlFor={`stock-title-${itemId}`} className={fieldLabelClass}>
            İşlem başlığı
          </label>
          <input
            id={`stock-title-${itemId}`}
            name="title"
            type="text"
            maxLength={120}
            placeholder="Örn. Yeni kart siparişi"
            className={fieldInputClass}
          />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="submit"
          name="direction"
          value="IN"
          disabled={pending}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
        >
          + Stok ekle
        </button>
        <button
          type="submit"
          name="direction"
          value="OUT"
          disabled={pending}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
        >
          − Stok çıkar
        </button>
      </div>
      {state.error ? <p role="alert" className="mt-3 text-xs font-semibold text-rose-600">{state.error}</p> : null}
      {state.success ? <p role="status" className="mt-3 text-xs font-semibold text-emerald-700">{itemName}: {state.success}</p> : null}
    </form>
  );
}

export function NewStockItemForm({
  action,
}: {
  action: (
    state: StockFormState,
    formData: FormData,
  ) => Promise<StockFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="stock-name" className={fieldLabelClass}>Ürün adı</label>
        <input id="stock-name" name="name" required maxLength={100} placeholder="NFC Google Card" className={fieldInputClass} />
      </div>
      <div>
        <label htmlFor="stock-initial-quantity" className={fieldLabelClass}>Başlangıç miktarı</label>
        <input id="stock-initial-quantity" name="quantity" required type="number" min="0" step="1" inputMode="numeric" placeholder="100" className={fieldInputClass} />
      </div>
      <div>
        <label htmlFor="stock-initial-title" className={fieldLabelClass}>İşlem başlığı</label>
        <input id="stock-initial-title" name="title" maxLength={120} placeholder="Örn. İlk stok girişi" className={fieldInputClass} />
      </div>
      {state.error ? <p role="alert" className="text-sm font-semibold text-rose-600">{state.error}</p> : null}
      {state.success ? <p role="status" className="text-sm font-semibold text-emerald-700">{state.success}</p> : null}
      <button type="submit" disabled={pending} className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60">
        {pending ? "Ekleniyor…" : "Stok ürünü ekle"}
      </button>
    </form>
  );
}
