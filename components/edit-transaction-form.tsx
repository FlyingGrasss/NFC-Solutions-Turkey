"use client";

import { useActionState, useState } from "react";
import { updateTransactionAction, type FormState } from "@/app/actions";
import { PayerPicker, type MemberOption } from "@/components/payer-picker";
import { SaleOwnerPicker, type SaleModeValue } from "@/components/sale-owner-picker";
import { fieldInputClass, fieldLabelClass } from "@/lib/ui";

export type EditableTransaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountCents: number;
  description: string;
  date: string;
  paidByMemberId: string | null;
  saleMode: SaleModeValue;
  soldByMemberId: string | null;
  leadId: string | null;
};

const initialState: FormState = {};

export function EditTransactionForm({
  transaction,
  onCancel,
  members,
}: {
  transaction: EditableTransaction;
  onCancel: () => void;
  members: MemberOption[];
}) {
  const [state, formAction, pending] = useActionState(updateTransactionAction, initialState);
  const [type, setType] = useState(transaction.type);
  const [paidByMemberId, setPaidByMemberId] = useState<string | null>(transaction.paidByMemberId);
  const [saleMode, setSaleMode] = useState<SaleModeValue>(transaction.saleMode);
  const [soldByMemberId, setSoldByMemberId] = useState<string | null>(transaction.soldByMemberId);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={transaction.id} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="paidByMemberId" value={paidByMemberId ?? "SPLIT"} />
      <input type="hidden" name="saleMode" value={type === "INCOME" ? saleMode : "UNASSIGNED"} />
      <input type="hidden" name="soldByMemberId" value={type === "INCOME" ? soldByMemberId ?? "" : ""} />
      <input type="hidden" name="leadId" value={transaction.leadId ?? ""} />

      <div>
        <span className={fieldLabelClass}>Tür</span>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" aria-pressed={type === "INCOME"} onClick={() => setType("INCOME")} className={type === "INCOME" ? "rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700" : "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-400 transition hover:border-emerald-300 hover:text-emerald-600"}>
            <span className="mb-1 block text-lg">↑</span>Gelir
          </button>
          <button type="button" aria-pressed={type === "EXPENSE"} onClick={() => setType("EXPENSE")} className={type === "EXPENSE" ? "rounded-2xl border-2 border-rose-500 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700" : "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-400 transition hover:border-rose-300 hover:text-rose-600"}>
            <span className="mb-1 block text-lg">↓</span>Gider
          </button>
        </div>
      </div>

      {type === "INCOME" ? (
        <div>
          <span className={fieldLabelClass}>Satışı yapan kişi</span>
          <SaleOwnerPicker members={members} mode={saleMode} soldByMemberId={soldByMemberId} onModeChange={setSaleMode} onSoldByChange={setSoldByMemberId} />
        </div>
      ) : null}

      <div>
        <span className={fieldLabelClass}>{type === "INCOME" ? "Parayı kim aldı?" : "Gideri kim ödedi?"}</span>
        <PayerPicker members={members} value={paidByMemberId} onChange={setPaidByMemberId} mode={type === "INCOME" ? "received" : "paid"} />
      </div>

      <div>
        <label htmlFor={`edit-amount-${transaction.id}`} className={fieldLabelClass}>Tutar</label>
        <div className="relative">
          <input id={`edit-amount-${transaction.id}`} name="amount" type="text" inputMode="decimal" required defaultValue={(transaction.amountCents / 100).toFixed(2).replace(".", ",")} className={`${fieldInputClass} pr-12`} />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-slate-400">₺</span>
        </div>
      </div>

      <div>
        <label htmlFor={`edit-description-${transaction.id}`} className={fieldLabelClass}>Açıklama</label>
        <input id={`edit-description-${transaction.id}`} name="description" type="text" maxLength={120} defaultValue={transaction.description} className={fieldInputClass} />
      </div>

      <div>
        <label htmlFor={`edit-date-${transaction.id}`} className={fieldLabelClass}>Tarih</label>
        <input id={`edit-date-${transaction.id}`} name="date" type="date" required defaultValue={transaction.date} className={fieldInputClass} />
      </div>

      {state.error ? <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p> : null}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50">Vazgeç</button>
        <button type="submit" disabled={pending} className="flex-1 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60">{pending ? "Kaydediliyor…" : "Değişiklikleri kaydet"}</button>
      </div>
    </form>
  );
}
