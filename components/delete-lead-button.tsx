"use client";

import { useState } from "react";
import { deleteLeadAction } from "@/app/lead-actions";
import { useModalScrollLock } from "@/components/use-modal-scroll-lock";
import { eyebrowClass, modalBackdropClass, modalCardClass } from "@/lib/ui";

export function DeleteLeadButton({ id, personName }: { id: string; personName: string }) {
  const [open, setOpen] = useState(false);

  useModalScrollLock(open);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-lg px-2 py-2 text-xs font-bold text-slate-300 transition hover:bg-rose-50 hover:text-rose-500">Sil</button>
      {open ? (
        <div className={modalBackdropClass} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div className={`${modalCardClass} max-w-md`} role="dialog" aria-modal="true" aria-labelledby={`lead-delete-title-${id}`}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className={`${eyebrowClass} text-rose-600`}>Takibi sil</p>
                <h2 id={`lead-delete-title-${id}`} className="mt-1 text-xl font-black text-slate-950">Emin misiniz?</h2>
              </div>
              <button type="button" aria-label="Pencereyi kapat" onClick={() => setOpen(false)} className="rounded-xl px-3 py-1 text-2xl leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-700">×</button>
            </div>
            <p className="text-sm leading-6 text-slate-500"><span className="font-bold text-slate-800">{personName}</span> takip kaydı silinecek.</p>
            <form action={deleteLeadAction} className="mt-7 flex gap-3">
              <input type="hidden" name="id" value={id} />
              <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50">Vazgeç</button>
              <button type="submit" className="flex-1 rounded-2xl bg-rose-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-rose-700">Evet, sil</button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
