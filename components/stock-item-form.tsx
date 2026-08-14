"use client";

import { useActionState, useState } from "react";
import { adjustStockAction, renameStockItemAction, type StockFormState } from "@/app/stock-actions";
import { fieldInputClass, fieldLabelClass, modalBackdropClass, modalCardClass } from "@/lib/ui";

const initialState: StockFormState = {};

export function StockNameEditor({
  itemId,
  initialName,
}: {
  itemId: string;
  initialName: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [state, formAction, pending] = useActionState(async (previousState: StockFormState, formData: FormData) => {
    const result = await renameStockItemAction(previousState, formData);

    if (result.success) {
      setOpen(false);
    }

    return result;
  }, initialState);

  function openEditor() {
    setName(initialName);
    setOpen(true);
  }

  return (
    <>
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 break-words text-base font-black text-slate-900">{initialName}</h3>
        <button
          type="button"
          onClick={openEditor}
          className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-500 transition hover:border-slate-400 hover:bg-white hover:text-slate-800"
        >
          Düzenle
        </button>
      </div>

      {open ? (
        <div className={modalBackdropClass} role="presentation">
          <section className={`${modalCardClass} max-w-md`} role="dialog" aria-modal="true" aria-labelledby={`stock-name-title-${itemId}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-emerald-600">Stok ürünü</p>
                <h2 id={`stock-name-title-${itemId}`} className="mt-1 text-xl font-black text-slate-950">Ürün adını düzenle</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-400 transition hover:bg-slate-50 hover:text-slate-700">Kapat</button>
            </div>
            <form action={formAction} className="mt-6 space-y-4">
              <input type="hidden" name="itemId" value={itemId} />
              <div>
                <label htmlFor={`stock-name-edit-${itemId}`} className={fieldLabelClass}>Ürün adı</label>
                <input id={`stock-name-edit-${itemId}`} name="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} className={fieldInputClass} />
              </div>
              {state.error ? <p role="alert" className="text-xs font-semibold text-rose-600">{state.error}</p> : null}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">İptal</button>
                <button type="submit" disabled={pending} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

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
