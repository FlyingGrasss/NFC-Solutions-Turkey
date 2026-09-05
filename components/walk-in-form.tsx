"use client";

import { useActionState, useCallback, useState } from "react";
import { addWalkInAction, type LeadFormState } from "@/app/lead-actions";
import { TransactionForm } from "@/components/transaction-form";
import type { MemberOption } from "@/components/payer-picker";
import { fieldInputClass, fieldLabelClass } from "@/lib/ui";

type WalkInStage = "REFUSED" | "DECISION_MAKER_ABSENT" | "STAFF_LIKED" | "STAFF_EXPECTS_BOSS_INTEREST" | "FOLLOW_UP_REQUESTED" | "ORDER_INTENT" | "ORDER_CONFIRMED";

const stageOptions: Array<{ value: WalkInStage; label: string; hint: string }> = [
  { value: "REFUSED", label: "Reddetti", hint: "İlgilenmedi" },
  { value: "DECISION_MAKER_ABSENT", label: "Yetkili yok", hint: "Karar verici burada değildi" },
  { value: "STAFF_LIKED", label: "Çalışan beğendi", hint: "Ürün güzel bulundu" },
  { value: "STAFF_EXPECTS_BOSS_INTEREST", label: "Patron beğenebilir", hint: "Yetkiliye önerecek" },
  { value: "FOLLOW_UP_REQUESTED", label: "Tekrar gel", hint: "Bugün veya yarın" },
  { value: "ORDER_INTENT", label: "İletişim / sipariş niyeti", hint: "İletişim bilgisi alındı" },
  { value: "ORDER_CONFIRMED", label: "Sipariş kesinleşti", hint: "Gelir kaydı aç" },
];

function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function WalkInForm({
  members,
  currentMemberId,
  defaultDate,
  businessSuggestions = [],
}: {
  members: MemberOption[];
  currentMemberId: string;
  defaultDate: string;
  businessSuggestions?: string[];
}) {
  const [businessName, setBusinessName] = useState("");
  const [stage, setStage] = useState<WalkInStage>("STAFF_LIKED");
  const [followUpAt, setFollowUpAt] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [details, setDetails] = useState("");
  const [spokeToDecisionMaker, setSpokeToDecisionMaker] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [followUpDates] = useState(() => ({ today: localDate(), tomorrow: localDate(1) }));

  const submitAction = useCallback(async (previousState: LeadFormState, formData: FormData) => {
    const result = await addWalkInAction(previousState, formData);
    if (result.shouldOpenIncome) {
      setShowIncome(true);
    } else if (result.success) {
      setBusinessName("");
      setStage("STAFF_LIKED");
      setFollowUpAt("");
      setContactInfo("");
      setDetails("");
      setSpokeToDecisionMaker(false);
    }
    return result;
  }, []);

  const [state, formAction, pending] = useActionState(submitAction, {});

  const showFollowUp = stage === "FOLLOW_UP_REQUESTED";
  const showContact = stage === "ORDER_INTENT" || stage === "ORDER_CONFIRMED";
  const showDecisionMaker = stage === "FOLLOW_UP_REQUESTED" || stage === "ORDER_INTENT" || stage === "ORDER_CONFIRMED";

  if (showIncome && state.leadId && state.businessName) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-700">Sipariş hazır</p>
          <p className="mt-1 text-lg font-black text-slate-900">{state.businessName}</p>
          <p className="mt-1 text-sm text-slate-600">Tutarı girerek bağlı gelir kaydını tamamla.</p>
        </div>
        <TransactionForm defaultType="INCOME" members={members} currentMemberId={currentMemberId} defaultPaidByMemberId={currentMemberId} defaultSoldByMemberId={currentMemberId} defaultLeadId={state.leadId} defaultDescription={state.businessName} defaultDate={defaultDate} />
        <button type="button" onClick={() => { setShowIncome(false); setBusinessName(""); setStage("STAFF_LIKED"); setFollowUpAt(""); setContactInfo(""); setDetails(""); setSpokeToDecisionMaker(false); }} className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50">Yeni ziyarete geç</button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="walk-in-business" className={fieldLabelClass}>İşletme adı</label>
        <input id="walk-in-business" name="businessName" value={businessName} onChange={(event) => setBusinessName(event.target.value)} required autoFocus autoComplete="organization" list="walk-in-business-suggestions" placeholder="Örn. Garage Alsancak" className={fieldInputClass} />
        <datalist id="walk-in-business-suggestions">{businessSuggestions.map((name) => <option key={name} value={name} />)}</datalist>
      </div>

      <div>
        <span className={fieldLabelClass}>Ne oldu?</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {stageOptions.map((option) => (
            <button key={option.value} type="button" aria-pressed={stage === option.value} onClick={() => setStage(option.value)} className={stage === option.value ? "rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-3 py-3 text-left text-emerald-800" : "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-slate-600 transition hover:border-emerald-300"}>
              <span className="block text-sm font-black">{option.label}</span>
              <span className="mt-0.5 block text-xs font-medium opacity-70">{option.hint}</span>
            </button>
          ))}
        </div>
        <input type="hidden" name="stage" value={stage} />
      </div>

      {showFollowUp ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <p className={fieldLabelClass}>Ne zaman tekrar gelelim?</p>
          <div className="grid grid-cols-3 gap-2">
            {[{ label: "Bugün", value: followUpDates.today }, { label: "Yarın", value: followUpDates.tomorrow }].map((option) => <button key={option.value} type="button" onClick={() => setFollowUpAt(option.value)} className={followUpAt === option.value ? "rounded-xl border-2 border-amber-500 bg-white px-2 py-2.5 text-xs font-black text-amber-800" : "rounded-xl border border-amber-200 bg-white/60 px-2 py-2.5 text-xs font-bold text-amber-700"}>{option.label}</button>)}
            <label className="rounded-xl border border-amber-200 bg-white/60 px-2 py-2.5 text-center text-xs font-bold text-amber-700"><span className="block">Özel tarih</span><input type="date" value={followUpAt !== followUpDates.today && followUpAt !== followUpDates.tomorrow ? followUpAt : ""} onChange={(event) => setFollowUpAt(event.target.value)} className="mt-1 w-full bg-transparent text-center text-xs outline-none" /></label>
          </div>
          <input type="hidden" name="followUpAt" value={followUpAt} />
        </div>
      ) : <input type="hidden" name="followUpAt" value="" />}

      {showDecisionMaker ? <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-600"><input type="checkbox" name="spokeToDecisionMaker" value="yes" checked={spokeToDecisionMaker} onChange={(event) => setSpokeToDecisionMaker(event.target.checked)} className="h-4 w-4 accent-emerald-600" />Yetkiliyle görüştüm</label> : <input type="hidden" name="spokeToDecisionMaker" value="no" />}

      {showContact ? <div><label htmlFor="walk-in-contact" className={fieldLabelClass}>İletişim bilgisi</label><input id="walk-in-contact" name="contactInfo" value={contactInfo} onChange={(event) => setContactInfo(event.target.value)} required={stage === "ORDER_INTENT"} placeholder="Telefon, Instagram veya WhatsApp" className={fieldInputClass} /></div> : <input type="hidden" name="contactInfo" value="" />}
      <div><label htmlFor="walk-in-details" className={fieldLabelClass}>Not <span className="font-medium text-slate-400">(opsiyonel)</span></label><textarea id="walk-in-details" name="details" value={details} onChange={(event) => setDetails(event.target.value)} rows={2} placeholder="Kısa not" className={`${fieldInputClass} h-auto py-3`} /></div>

      {state.error ? <p role="alert" className="text-sm font-semibold text-rose-600">{state.error}</p> : null}
      {state.success ? <p role="status" className="text-sm font-semibold text-emerald-700">{state.success}</p> : null}
      <button type="submit" disabled={pending} className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60">{pending ? "Kaydediliyor…" : stage === "ORDER_CONFIRMED" ? "Kaydet ve gelir ekle" : "Kaydet ve yenisine geç"}</button>
    </form>
  );
}
