"use client";

import { FormEvent, useRef, useState } from "react";
import { addColdWalkInNoteAction, renameColdWalkInAction, setColdWalkInOutcomeAction } from "@/app/cold-walk-in-actions";
import { generateGoogleReviewLinkAction } from "@/app/google-review-actions";
import { eyebrowClass, fieldInputClass, fieldLabelClass, panelClass } from "@/lib/ui";

type Member = { id: string; name: string };
type Note = { id: string; text: string; createdAt: string; memberName: string };
export type ReviewWalkIn = { id: string; name: string; reviewUrl: string; wasSold: boolean; createdAt: string; creatorName: string; participantIds: string[]; participantNames: string[]; notes: Note[] };
type NdefReader = { write: (message: { records: Array<{ recordType: "url"; data: string }> }, options?: { signal?: AbortSignal; overwrite?: boolean }) => Promise<void> };
type NdefReaderConstructor = new () => NdefReader;

const dateTime = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

function Analytics({ walkIns, members }: { walkIns: ReviewWalkIn[]; members: Member[] }) {
  const rows = [{ id: "all", name: "Toplam", items: walkIns }, ...members.map((member) => ({ id: member.id, name: member.name, items: walkIns.filter((item) => item.participantIds.includes(member.id)) }))];
  return <section className="mt-6 grid gap-3 sm:grid-cols-3">{rows.map((row) => {
    const sold = row.items.filter((item) => item.wasSold).length;
    const failed = row.items.length - sold;
    const soldPercent = row.items.length ? Math.round((sold / row.items.length) * 100) : 0;
    return <article key={row.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_38px_rgb(25_55_36_/_0.05)]"><p className={eyebrowClass}>{row.name}</p><p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{row.items.length}</p><p className="mt-1 text-xs font-semibold text-slate-400">cold walk-in</p><div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4"><div><p className="text-lg font-black text-emerald-700">{sold} · %{soldPercent}</p><p className="text-[0.68rem] font-bold text-slate-400">Başarılı</p></div><div><p className="text-lg font-black text-rose-600">{failed} · %{100 - soldPercent}</p><p className="text-[0.68rem] font-bold text-slate-400">Başarısız</p></div></div></article>;
  })}</section>;
}

function WalkInRow({ item, onOutcome, onRename, onNote }: { item: ReviewWalkIn; onOutcome: (id: string, sold: boolean) => void; onRename: (id: string, name: string) => void; onNote: (id: string, note: Note | null, replaceId?: string) => void }) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  async function submitNote(event: FormEvent) {
    event.preventDefault();
    const text = note.trim(); if (!text || sending) return;
    const optimistic: Note = { id: `optimistic-${crypto.randomUUID()}`, text, createdAt: new Date().toISOString(), memberName: "Kaydediliyor" };
    setNote(""); setSending(true); onNote(item.id, optimistic);
    const data = new FormData(); data.set("leadId", item.id); data.set("text", text);
    const result = await addColdWalkInNoteAction(data);
    if (result.note) onNote(item.id, result.note, optimistic.id);
    else { onNote(item.id, null, optimistic.id); setNote(text); }
    setSending(false);
  }
  return <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgb(25_55_36_/_0.04)] sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><input aria-label="İşletme adı" defaultValue={item.name} onBlur={(event) => { const name = event.currentTarget.value.trim(); if (name && name !== item.name) onRename(item.id, name); }} className="w-full bg-transparent text-base font-black text-slate-900 outline-none focus:text-emerald-700" /><p className="mt-1 text-xs text-slate-400">{item.participantNames.join(" + ")} · {dateTime.format(new Date(item.createdAt))}</p></div><label className="flex cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600"><input type="checkbox" checked={item.wasSold} onChange={(event) => onOutcome(item.id, event.target.checked)} className="accent-emerald-600" /><span>{item.wasSold ? "Satıldı" : "Satılmadı"}</span></label></div>
    {item.notes.length ? <div className="mt-4 space-y-2">{item.notes.map((entry) => <div key={entry.id} className="max-w-[88%] rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2"><p className="text-sm leading-5 text-slate-700">{entry.text}</p><p className="mt-1 text-[0.65rem] font-semibold text-slate-400">{entry.memberName} · {dateTime.format(new Date(entry.createdAt))}</p></div>)}</div> : null}
    <form onSubmit={submitNote} className="mt-4 flex gap-2"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Bir not yaz…" maxLength={1000} className={`${fieldInputClass} min-w-0`} /><button disabled={!note.trim() || sending} className="shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-black text-white disabled:opacity-40" type="submit">Gönder</button></form>
  </article>;
}

export function GoogleReviewAdminTool({ initialWalkIns, legacyWalkIns, members, currentMember }: { initialWalkIns: ReviewWalkIn[]; legacyWalkIns: Array<{ id: string; name: string; details: string | null; createdAt: string }>; members: Member[]; currentMember: Member }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [input, setInput] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [walkIns, setWalkIns] = useState(initialWalkIns);
  const [together, setTogether] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nfcSupported] = useState(() => typeof window !== "undefined" && "NDEFReader" in window);
  const [nfcStatus, setNfcStatus] = useState<string | null>(null);

  async function generate(value = input) {
    const clean = value.trim(); if (!clean || pending) return;
    setPending(true); setMessage(null); setError(null); setNfcStatus(null);
    try {
      const data = new FormData(); data.set("mapsUrl", clean); data.set("together", String(together));
      const result = await generateGoogleReviewLinkAction(data);
      if (result.error || !result.reviewUrl) { setError(result.error ?? "Bağlantı oluşturulamadı."); return; }
      setReviewUrl(result.reviewUrl);
      if (result.duplicate) setMessage("Bu işletme daha önce oluşturuldu.");
      else if (result.leadId) {
        const participants = together ? members : [currentMember];
        setWalkIns((current) => [{ id: result.leadId!, name: result.placeName ?? "İsimsiz işletme", reviewUrl: result.reviewUrl!, wasSold: false, createdAt: new Date().toISOString(), creatorName: currentMember.name, participantIds: participants.map((member) => member.id), participantNames: participants.map((member) => member.name), notes: [] }, ...current]);
        setMessage(`${result.placeName ?? "İşletme"} eklendi; yorum bağlantısı hazır.`);
      }
    } catch { setError("Bağlantı oluşturulamadı. Lütfen tekrar deneyin."); }
    finally { setPending(false); }
  }

  function clear() { abortRef.current?.abort(); setInput(""); setReviewUrl(""); setMessage(null); setError(null); setNfcStatus(null); requestAnimationFrame(() => inputRef.current?.focus()); }
  async function copy() { try { await navigator.clipboard.writeText(reviewUrl); setNfcStatus("Bağlantı kopyalandı."); } catch { setError("Bağlantı kopyalanamadı."); } }
  async function writeNfc() {
    if (!reviewUrl) return;
    const Reader = (window as unknown as { NDEFReader?: NdefReaderConstructor }).NDEFReader;
    if (!Reader) return copy();
    abortRef.current?.abort(); const controller = new AbortController(); abortRef.current = controller;
    setError(null); setNfcStatus("Kartı telefonun arkasına yaklaştırın…");
    try { await new Reader().write({ records: [{ recordType: "url", data: reviewUrl }] }, { signal: controller.signal, overwrite: true }); setNfcStatus("Bağlantı karta yazıldı."); }
    catch (cause) { if ((cause as { name?: string }).name !== "AbortError") setError("NFC yazılamadı. Chrome, NFC izni ve kartı kontrol edin."); }
  }
  async function changeOutcome(id: string, sold: boolean) { setWalkIns((current) => current.map((item) => item.id === id ? { ...item, wasSold: sold } : item)); const data = new FormData(); data.set("leadId", id); data.set("wasSold", String(sold)); const result = await setColdWalkInOutcomeAction(data); if (result.error) setWalkIns((current) => current.map((item) => item.id === id ? { ...item, wasSold: !sold } : item)); }
  async function rename(id: string, name: string) { setWalkIns((current) => current.map((item) => item.id === id ? { ...item, name } : item)); const data = new FormData(); data.set("leadId", id); data.set("name", name); await renameColdWalkInAction(data); }
  function addNote(id: string, note: Note | null, replaceId?: string) { setWalkIns((current) => current.map((item) => item.id !== id ? item : { ...item, notes: replaceId ? note ? item.notes.map((entry) => entry.id === replaceId ? note : entry) : item.notes.filter((entry) => entry.id !== replaceId) : note ? [...item.notes, note] : item.notes })); }

  return <>
    <section className={`${panelClass} mt-6`}><div className="mb-5 flex items-start justify-between gap-4"><div><p className={eyebrowClass}>Google yorumları</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Yorum bağlantısı oluştur</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Maps bağlantısını yapıştır. Yorum linki hazırlanır ve işletme otomatik olarak saha listene eklenir.</p></div><button type="button" onClick={clear} className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700">Temizle</button></div>
      <label htmlFor="maps-url" className={fieldLabelClass}>Google Maps bağlantısı veya Place ID</label><div className="flex flex-col gap-2 sm:flex-row"><input ref={inputRef} id="maps-url" value={input} onChange={(event) => setInput(event.target.value)} onPaste={(event) => { const value = event.clipboardData.getData("text"); setInput(value); setTimeout(() => generate(value), 0); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void generate(); } }} autoFocus placeholder="https://maps.app.goo.gl/..." className={fieldInputClass} /><button type="button" onClick={() => generate()} disabled={pending || !input.trim()} className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{pending ? "Hazırlanıyor…" : "Oluştur"}</button></div>
      {reviewUrl ? <div className="mt-4"><label className={fieldLabelClass}>Doğrudan yorum bağlantısı</label><div className="flex flex-col gap-2 sm:flex-row"><input readOnly value={reviewUrl} className={fieldInputClass} /><button type="button" onClick={nfcSupported ? writeNfc : copy} className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">{nfcSupported ? "NFC’ye yaz" : "Kopyala"}</button></div></div> : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><div>{message ? <p className="text-xs font-bold text-emerald-700">{message}</p> : null}{nfcStatus ? <p className="text-xs font-bold text-emerald-700">{nfcStatus}</p> : null}{error ? <p role="alert" className="text-xs font-bold text-rose-600">{error}</p> : null}</div><label className="flex cursor-pointer items-center gap-2 text-xs font-black text-slate-600"><input type="checkbox" checked={together} onChange={(event) => setTogether(event.target.checked)} className="accent-emerald-600" />Birlikte saha modu</label></div>
    </section>
    <Analytics walkIns={walkIns} members={members} />
    <section className="mt-6"><div className="mb-4 flex items-end justify-between"><div><p className={eyebrowClass}>Saha geçmişi</p><h2 className="mt-1 text-xl font-black text-slate-950">İşletmeler</h2></div><span className="text-xs font-semibold text-slate-400">{walkIns.length} kayıt</span></div><div className="grid gap-3 lg:grid-cols-2">{walkIns.map((item) => <WalkInRow key={item.id} item={item} onOutcome={changeOutcome} onRename={rename} onNote={addNote} />)}</div>{walkIns.length === 0 ? <div className="rounded-3xl bg-white py-12 text-center text-sm text-slate-400">İlk Maps bağlantını yapıştırarak başla.</div> : null}{legacyWalkIns.length ? <details className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3"><summary className="cursor-pointer text-xs font-black text-slate-500">{legacyWalkIns.length} eski cold walk-in kaydı</summary><div className="mt-3 divide-y divide-slate-100">{legacyWalkIns.map((item) => <div key={item.id} className="py-3"><p className="text-sm font-black text-slate-700">{item.name}</p><p className="mt-1 text-xs text-slate-400">{dateTime.format(new Date(item.createdAt))}</p>{item.details ? <p className="mt-2 text-sm text-slate-500">{item.details}</p> : null}</div>)}</div><p className="mt-3 text-xs leading-5 text-slate-400">Bu kayıtlar korunuyor ancak yeni başarı oranına dahil edilmiyor.</p></details> : null}</section>
  </>;
}
