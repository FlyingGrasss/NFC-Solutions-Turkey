"use client";

import { useEffect, useState } from "react";
import { updateLeadAction } from "@/app/lead-actions";
import { LeadForm, type EditableLead } from "@/components/lead-form";
import { useModalScrollLock } from "@/components/use-modal-scroll-lock";
import { eyebrowClass, modalBackdropClass, modalCardClass } from "@/lib/ui";

export function EditLeadModal({ lead }: { lead: EditableLead }) {
  const [open, setOpen] = useState(false);

  useModalScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-lg px-2 py-2 text-xs font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">Düzenle</button>
      {open ? (
        <div className={modalBackdropClass} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div className={`${modalCardClass} max-w-lg`} role="dialog" aria-modal="true" aria-labelledby={`lead-edit-title-${lead.id}`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className={eyebrowClass}>Takibi düzenle</p>
                <h2 id={`lead-edit-title-${lead.id}`} className="mt-1 text-2xl font-black text-slate-950">{lead.personName}</h2>
              </div>
              <button type="button" aria-label="Pencereyi kapat" onClick={() => setOpen(false)} className="rounded-xl px-3 py-1 text-2xl leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-700">×</button>
            </div>
            <LeadForm action={updateLeadAction} lead={lead} onCancel={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
