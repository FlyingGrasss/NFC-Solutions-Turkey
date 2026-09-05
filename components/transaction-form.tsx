"use client";

import { useActionState, useEffect, useState } from "react";
import { addTransactionAction, type FormState } from "@/app/actions";
import { PayerPicker, type MemberOption } from "@/components/payer-picker";
import { SaleOwnerPicker, type SaleModeValue } from "@/components/sale-owner-picker";
import { fieldInputClass, fieldLabelClass } from "@/lib/ui";

type TransactionType = "INCOME" | "EXPENSE";

const initialState: FormState = {};
type TransactionAction = (state: FormState, formData: FormData) => Promise<FormState>;

export function TransactionForm({
  defaultType,
  members,
  currentMemberId,
  defaultPaidByMemberId = null,
  defaultSaleMode = "SOLO",
  defaultSoldByMemberId = null,
  defaultLeadId = null,
  defaultDescription = "",
  defaultDate,
  action = addTransactionAction,
  onSuccess,
}: {
  defaultType: TransactionType;
  members: MemberOption[];
  currentMemberId?: string;
  defaultPaidByMemberId?: string | null;
  defaultSaleMode?: SaleModeValue;
  defaultSoldByMemberId?: string | null;
  defaultLeadId?: string | null;
  defaultDescription?: string;
  defaultDate?: string;
  action?: TransactionAction;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [type, setType] = useState<TransactionType>(defaultType);
  const [paidByMemberId, setPaidByMemberId] = useState<string | null>(defaultPaidByMemberId ?? currentMemberId ?? null);
  const [saleMode, setSaleMode] = useState<SaleModeValue>(defaultSaleMode);
  const [soldByMemberId, setSoldByMemberId] = useState<string | null>(defaultSoldByMemberId ?? currentMemberId ?? null);
  const [date] = useState(defaultDate ?? new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [onSuccess, state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="paidByMemberId" value={paidByMemberId ?? "SPLIT"} />
      <input type="hidden" name="saleMode" value={type === "INCOME" ? saleMode : "UNASSIGNED"} />
      <input type="hidden" name="soldByMemberId" value={type === "INCOME" ? soldByMemberId ?? "" : ""} />
      {defaultLeadId ? <input type="hidden" name="leadId" value={defaultLeadId} /> : null}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-pressed={type === "INCOME"}
          onClick={() => setType("INCOME")}
          className={type === "INCOME"
            ? "rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700"
            : "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-400 transition hover:border-emerald-300 hover:text-emerald-600"}
        >
          <span className="mb-1 block text-lg">↑</span>
          Gelir
        </button>
        <button
          type="button"
          aria-pressed={type === "EXPENSE"}
          onClick={() => setType("EXPENSE")}
          className={type === "EXPENSE"
            ? "rounded-2xl border-2 border-rose-500 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700"
            : "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-400 transition hover:border-rose-300 hover:text-rose-600"}
        >
          <span className="mb-1 block text-lg">↓</span>
          Gider
        </button>
      </div>

      {type === "INCOME" ? (
        <div>
          <span className={fieldLabelClass}>Satışı yapan kişi</span>
          <SaleOwnerPicker
            members={members}
            mode={saleMode}
            soldByMemberId={soldByMemberId}
            onModeChange={setSaleMode}
            onSoldByChange={setSoldByMemberId}
          />
        </div>
      ) : null}

      <div>
        <span className={fieldLabelClass}>{type === "INCOME" ? "Parayı kim aldı?" : "Gideri kim ödedi?"}</span>
        <PayerPicker members={members} value={paidByMemberId} onChange={setPaidByMemberId} mode={type === "INCOME" ? "received" : "paid"} />
      </div>

      <div>
        <label htmlFor="amount" className={fieldLabelClass}>Tutar</label>
        <div className="relative">
          <input id="amount" name="amount" type="text" inputMode="decimal" required autoFocus placeholder="0,00" className={`${fieldInputClass} pr-12`} />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-slate-400">₺</span>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={fieldLabelClass}>{type === "INCOME" ? "İşletme / açıklama" : "Açıklama"}</label>
        <input id="description" name="description" type="text" maxLength={120} defaultValue={defaultDescription} placeholder={type === "INCOME" ? "Örn. Garage Alsancak" : "Örn. baskı gideri"} className={fieldInputClass} />
      </div>

      <details className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <summary className="cursor-pointer text-xs font-extrabold text-slate-500">Tarihi değiştir</summary>
        <input id="date" name="date" type="date" required defaultValue={date} className={`${fieldInputClass} mt-3 bg-white`} />
      </details>

      {state.error ? <p role="alert" className="text-sm font-medium text-rose-600">{state.error}</p> : null}
      {state.success ? <p role="status" className="text-sm font-medium text-emerald-700">{state.success}</p> : null}
      <button type="submit" disabled={pending} className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60">
        {pending ? "Ekleniyor…" : type === "INCOME" ? "Geliri ekle" : "Gideri ekle"}
      </button>
    </form>
  );
}
