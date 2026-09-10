"use client";

import { FormEvent, useRef, useState } from "react";
import { addColdWalkInNoteAction, renameColdWalkInAction, setColdWalkInOutcomeAction, setColdWalkInOwnerAction } from "@/app/cold-walk-in-actions";
import { generateGoogleReviewLinkAction } from "@/app/google-review-actions";
import { eyebrowClass, fieldInputClass, fieldLabelClass, panelClass } from "@/lib/ui";

type Member = { id: string; name: string; role: "ADMIN" | "REVIEW_AGENT" };
type Note = { id: string; text: string; createdAt: string; memberName: string };
export type ReviewWalkIn = { id: string; name: string; reviewUrl: string | null; wasSold: boolean; createdAt: string; creatorName: string; participantIds: string[]; participantNames: string[]; notes: Note[] };
type NdefReader = { write: (message: { records: Array<{ recordType: "url"; data: string }> }, options?: { signal?: AbortSignal; overwrite?: boolean }) => Promise<void> };
type NdefReaderConstructor = new () => NdefReader;
const dateTime = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

function WalkInRow({ item, members, onChange }: { item: ReviewWalkIn; members: Member[]; onChange: (id: string, patch: Partial<ReviewWalkIn>) => void }) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const ownerValue = item.participantIds.length > 1 ? "JOINT" : item.participantIds[0] ?? "";

  async function submitNote(event: FormEvent) {
    event.preventDefault(); const text = note.trim(); if (!text || sending) return;
    const optimistic: Note = { id: `optimistic-${crypto.randomUUID()}`, text, createdAt: new Date().toISOString(), memberName: "Kaydediliyor" };
    setNote(""); setSending(true); onChange(item.id, { notes: [...item.notes, optimistic] });
    const data = new FormData(); data.set("leadId", item.id); data.set("text", text);
    const result = await addColdWalkInNoteAction(data);
    onChange(item.id, { notes: result.note ? [...item.notes, result.note] : item.notes });
    if (!result.note) setNote(text); setSending(false);
  }

  async function changeOwner(value: string) {
    const selected = value === "JOINT" ? members.filter((member) => member.name === "Emre" || member.name === "Başar") : members.filter((member) => member.id === value);
    const previous = { participantIds: item.participantIds, participantNames: item.participantNames };
    onChange(item.id, { participantIds: selected.map((member) => member.id), participantNames: selected.map((member) => member.name) });
    const data = new FormData(); data.set("leadId", item.id); data.set("owner", value);
    const result = await setColdWalkInOwnerAction(data); if (result.error) onChange(item.id, previous);
  }

  async function changeOutcome(wasSold: boolean) {
    onChange(item.id, { wasSold }); const data = new FormData(); data.set("leadId", item.id); data.set("wasSold", String(wasSold));
    const result = await setColdWalkInOutcomeAction(data); if (result.error) onChange(item.id, { wasSold: !wasSold });
  }

  async function rename(name: string) {
    if (!name || name === item.name) return; const previous = item.name; onChange(item.id, { name });
    const data = new FormData(); data.set("leadId", item.id); data.set("name", name); const result = await renameColdWalkInAction(data);
    if (result.error) onChange(item.id, { name: previous });
  }

  return <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgb(25_55_36_/_0.04)] sm:p-5">
    <div className="flex min-w-0 flex-nowrap items-start gap-3"><div className="min-w-0 flex-1"><input aria-label="İşletme adı" defaultValue={item.name} onBlur={(event) => rename(event.currentTarget.value.trim())} className="block w-full truncate whitespace-nowrap bg-transparent text-base font-black text-slate-900 outline-none focus:text-emerald-700" /><p className="mt-1 truncate text-xs text-slate-400">{item.participantNames.join(" + ") || "Saha sahibi seçilmedi"} · {dateTime.format(new Date(item.createdAt))}</p></div><label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600"><input type="checkbox" checked={item.wasSold} onChange={(event) => changeOutcome(event.target.checked)} className="accent-emerald-600" />{item.wasSold ? "Satıldı" : "Satılmadı"}</label></div>
    <div className="mt-3"><label className={fieldLabelClass}>Cold walk-in’i kim yaptı?</label><select value={ownerValue} onChange={(event) => changeOwner(event.target.value)} className={`${fieldInputClass} h-10`}><option value="">Seçilmedi</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}<option value="JOINT">Emre + Başar</option></select></div>
    {item.notes.length ? <div className="mt-4 space-y-2">{item.notes.map((entry) => <div key={entry.id} className="max-w-[88%] rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2"><p className="text-sm leading-5 text-slate-700">{entry.text}</p><p className="mt-1 text-[0.65rem] font-semibold text-slate-400">{entry.memberName} · {dateTime.format(new Date(entry.createdAt))}</p></div>)}</div> : null}
    <form onSubmit={submitNote} className="mt-4 flex gap-2"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Bir not yaz…" maxLength={1000} className={`${fieldInputClass} min-w-0`} /><button disabled={!note.trim() || sending} className="shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-black text-white disabled:opacity-40">Gönder</button></form>
  </article>;
}

export function GoogleReviewAdminTool({ initialWalkIns, members, currentMember }: { initialWalkIns: ReviewWalkIn[]; members: Member[]; currentMember: Member }) {
  const inputRef = useRef<HTMLInputElement>(null); const abortRef = useRef<AbortController | null>(null);
  const [input, setInput] = useState(""); const [reviewUrl, setReviewUrl] = useState(""); const [walkIns, setWalkIns] = useState(initialWalkIns);
  const [together, setTogether] = useState(false); const [pending, setPending] = useState(false); const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null); const [nfcStatus, setNfcStatus] = useState<string | null>(null);
  const [nfcSupported] = useState(() => typeof window !== "undefined" && "NDEFReader" in window);
  const partnerMembers = members.filter((member) => member.name === "Emre" || member.name === "Başar");

  async function generate(value = input) {
    const clean = value.trim(); if (!clean || pending) return; setPending(true); setMessage(null); setError(null); setNfcStatus(null);
    try {
      const data = new FormData(); data.set("mapsUrl", clean); data.set("together", String(together && currentMember.role === "ADMIN"));
      const result = await generateGoogleReviewLinkAction(data); if (result.error || !result.reviewUrl) { setError(result.error ?? "Bağlantı oluşturulamadı."); return; }
      setReviewUrl(result.reviewUrl);
      if (result.duplicate) setMessage("Bu işletme daha önce oluşturuldu.");
      else if (result.leadId) { const participants = together ? partnerMembers : [currentMember]; setWalkIns((current) => [{ id: result.leadId!, name: result.placeName ?? "İsimsiz işletme", reviewUrl: result.reviewUrl!, wasSold: false, createdAt: new Date().toISOString(), creatorName: currentMember.name, participantIds: participants.map((member) => member.id), participantNames: participants.map((member) => member.name), notes: [] }, ...current]); setMessage("İşletme eklendi; yorum bağlantısı hazır."); }
    } catch { setError("Bağlantı oluşturulamadı. Lütfen tekrar deneyin."); } finally { setPending(false); }
  }
  function clear() { abortRef.current?.abort(); setInput(""); setReviewUrl(""); setMessage(null); setError(null); setNfcStatus(null); requestAnimationFrame(() => inputRef.current?.focus()); }
  async function copy() { try { await navigator.clipboard.writeText(reviewUrl); setNfcStatus("Bağlantı kopyalandı."); } catch { setError("Bağlantı kopyalanamadı."); } }
  async function writeNfc() { if (!reviewUrl) return; const Reader = (window as unknown as { NDEFReader?: NdefReaderConstructor }).NDEFReader; if (!Reader) return copy(); abortRef.current?.abort(); const controller = new AbortController(); abortRef.current = controller; setNfcStatus("Kartı telefonun arkasına yaklaştırın…"); try { await new Reader().write({ records: [{ recordType: "url", data: reviewUrl }] }, { signal: controller.signal, overwrite: true }); setNfcStatus("Bağlantı karta yazıldı."); } catch (cause) { if ((cause as { name?: string }).name !== "AbortError") setError("NFC yazılamadı. Chrome, NFC izni ve kartı kontrol edin."); } }
  function updateWalkIn(id: string, patch: Partial<ReviewWalkIn>) { setWalkIns((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item)); }

  return <><section className={`${panelClass} mt-6`}><div className="mb-5 flex items-start justify-between gap-4"><div><p className={eyebrowClass}>Google yorumları</p><h2 className="mt-1 text-xl font-black">Yorum bağlantısı oluştur</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Maps bağlantısını yapıştır. Yorum linki hazırlanır ve işletme otomatik olarak saha listene eklenir.</p></div><button type="button" onClick={clear} className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:bg-slate-100">Temizle</button></div><label htmlFor="maps-url" className={fieldLabelClass}>Google Maps bağlantısı veya Place ID</label><div className="flex flex-col gap-2 sm:flex-row"><input ref={inputRef} id="maps-url" value={input} onChange={(event) => setInput(event.target.value)} onPaste={(event) => { const value = event.clipboardData.getData("text"); setInput(value); setTimeout(() => generate(value), 0); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void generate(); } }} autoFocus placeholder="https://maps.app.goo.gl/..." className={fieldInputClass} /><button type="button" onClick={() => generate()} disabled={pending || !input.trim()} className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{pending ? "Hazırlanıyor…" : "Oluştur"}</button></div>{reviewUrl ? <div className="mt-4"><label className={fieldLabelClass}>Doğrudan yorum bağlantısı</label><div className="flex flex-col gap-2 sm:flex-row"><input readOnly value={reviewUrl} className={fieldInputClass} /><button type="button" onClick={nfcSupported ? writeNfc : copy} className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white">{nfcSupported ? "NFC’ye yaz" : "Kopyala"}</button></div></div> : null}<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><div>{message ? <p className="text-xs font-bold text-emerald-700">{message}</p> : null}{nfcStatus ? <p className="text-xs font-bold text-emerald-700">{nfcStatus}</p> : null}{error ? <p className="text-xs font-bold text-rose-600">{error}</p> : null}</div>{currentMember.role === "ADMIN" ? <label className="flex items-center gap-2 text-xs font-black text-slate-600"><input type="checkbox" checked={together} onChange={(event) => setTogether(event.target.checked)} />Birlikte saha modu</label> : null}</div></section><section className="mt-6"><div className="mb-4 flex items-end justify-between"><div><p className={eyebrowClass}>Saha geçmişi</p><h2 className="mt-1 text-xl font-black">İşletmeler</h2></div><span className="text-xs text-slate-400">{walkIns.length} kayıt</span></div><div className="grid gap-3 lg:grid-cols-2">{walkIns.map((item) => <WalkInRow key={item.id} item={item} members={members} onChange={updateWalkIn} />)}</div></section></>;
}
