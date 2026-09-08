"use client";

import { useEffect, useState } from "react";
import {
  EditTransactionForm,
  type EditableTransaction,
} from "@/components/edit-transaction-form";
import type { MemberOption } from "@/components/payer-picker";
import { useModalScrollLock } from "@/components/use-modal-scroll-lock";
import { eyebrowClass, modalBackdropClass, modalCardClass } from "@/lib/ui";

export function EditTransactionModal({
  transaction,
  members,
}: {
  transaction: EditableTransaction;
  members: MemberOption[];
}) {
  const [open, setOpen] = useState(false);

  useModalScrollLock(open);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg px-2 py-2 text-xs font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        Düzenle
      </button>

      {open ? (
        <div
          className={modalBackdropClass}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            className={`${modalCardClass} max-w-lg`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-title-${transaction.id}`}
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className={eyebrowClass}>Kayıt düzenle</p>
                <h2
                  id={`edit-title-${transaction.id}`}
                  className="mt-1 text-2xl font-black tracking-tight text-slate-950"
                >
                  Hareketi güncelle
                </h2>
              </div>
              <button
                type="button"
                aria-label="Pencereyi kapat"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-1 text-2xl leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>
            <EditTransactionForm
              transaction={transaction}
              onCancel={() => setOpen(false)}
              members={members}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
