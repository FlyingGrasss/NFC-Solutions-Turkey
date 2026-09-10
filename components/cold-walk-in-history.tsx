"use client";

import { useState, type FormEvent } from "react";
import { addColdWalkInNoteAction, renameColdWalkInAction, setColdWalkInOutcomeAction, setColdWalkInOwnerAction } from "@/app/cold-walk-in-actions";
import { eyebrowClass, fieldInputClass, fieldLabelClass, panelClass } from "@/lib/ui";

type Member = { id: string; name: string; role: "ADMIN" | "REVIEW_AGENT" };
type Note = { id: string; text: string; createdAt: string; memberName: string };
export type ColdWalkInRecord = { id: string; name: string; wasSold: boolean; createdAt: string; participantIds: string[]; participantNames: string[]; notes: Note[] };

const dateTime = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

function WalkInRow({ item, members, onChange }: { item: ColdWalkInRecord; members: Member[]; onChange: (id: string, patch: Partial<ColdWalkInRecord>) => void }) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const ownerValue = item.participantIds.length > 1 ? "JOINT" : item.participantIds[0] ?? "";

  async function submitNote(event: FormEvent) {
    event.preventDefault();
    const text = note.trim();
    if (!text || sending) return;
    const optimistic: Note = { id: `optimistic-${crypto.randomUUID()}`, text, createdAt: new Date().toISOString(), memberName: "Kaydediliyor" };
    setNote("");
    setSending(true);
    onChange(item.id, { notes: [...item.notes, optimistic] });
    const data = new FormData();
    data.set("leadId", item.id);
    data.set("text", text);
    const result = await addColdWalkInNoteAction(data);
    onChange(item.id, { notes: result.note ? [...item.notes, result.note] : item.notes });
    if (!result.note) setNote(text);
    setSending(false);
  }

  async function changeOwner(value: string) {
    const selected = value === "JOINT" ? members.filter((member) => member.name === "Emre" || member.name === "Başar") : members.filter((member) => member.id === value);
    const previous = { participantIds: item.participantIds, participantNames: item.participantNames };
    onChange(item.id, { participantIds: selected.map((member) => member.id), participantNames: selected.map((member) => member.name) });
    const data = new FormData();
    data.set("leadId", item.id);
    data.set("owner", value);
    const result = await setColdWalkInOwnerAction(data);
    if (result.error) onChange(item.id, previous);
  }

  async function changeOutcome(wasSold: boolean) {
    onChange(item.id, { wasSold });
    const data = new FormData();
    data.set("leadId", item.id);
    data.set("wasSold", String(wasSold));
    const result = await setColdWalkInOutcomeAction(data);
    if (result.error) onChange(item.id, { wasSold: !wasSold });
  }

  async function rename(name: string) {
    if (!name || name === item.name) return;
    const previous = item.name;
    onChange(item.id, { name });
    const data = new FormData();
    data.set("leadId", item.id);
    data.set("name", name);
    const result = await renameColdWalkInAction(data);
    if (result.error) onChange(item.id, { name: previous });
  }

  return <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgb(25_55_36_/_0.04)] sm:p-5">
    <div className="flex min-w-0 flex-nowrap items-start gap-3"><div className="min-w-0 flex-1"><input aria-label="İşletme adı" defaultValue={item.name} onBlur={(event) => rename(event.currentTarget.value.trim())} className="block w-full truncate whitespace-nowrap bg-transparent text-base font-black text-slate-900 outline-none focus:text-emerald-700" /><p className="mt-1 truncate text-xs text-slate-400">{item.participantNames.join(" + ") || "Saha sahibi seçilmedi"} · {dateTime.format(new Date(item.createdAt))}</p></div><label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600"><input type="checkbox" checked={item.wasSold} onChange={(event) => changeOutcome(event.target.checked)} className="accent-emerald-600" />{item.wasSold ? "Satıldı" : "Satılmadı"}</label></div>
    <div className="mt-3"><label className={fieldLabelClass}>Cold walk-in’i kim yaptı?</label><select value={ownerValue} onChange={(event) => changeOwner(event.target.value)} className={`${fieldInputClass} h-10`}><option value="">Seçilmedi</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}<option value="JOINT">Emre + Başar</option></select></div>
    {item.notes.length ? <div className="mt-4 space-y-2">{item.notes.map((entry) => <div key={entry.id} className="max-w-[88%] rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2"><p className="text-sm leading-5 text-slate-700">{entry.text}</p><p className="mt-1 text-[0.65rem] font-semibold text-slate-400">{entry.memberName} · {dateTime.format(new Date(entry.createdAt))}</p></div>)}</div> : null}
    <form onSubmit={submitNote} className="mt-4 flex gap-2"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Bir not yaz…" maxLength={1000} className={`${fieldInputClass} min-w-0`} /><button type="submit" disabled={!note.trim() || sending} className="shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-black text-white disabled:opacity-40">Gönder</button></form>
  </article>;
}

export function ColdWalkInHistory({ initialWalkIns, members }: { initialWalkIns: ColdWalkInRecord[]; members: Member[] }) {
  const [walkIns, setWalkIns] = useState(initialWalkIns);

  function updateWalkIn(id: string, patch: Partial<ColdWalkInRecord>) {
    setWalkIns((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  return <section className="mt-6"><div className="mb-4 flex items-end justify-between gap-3"><div><p className={eyebrowClass}>Saha geçmişi</p><h2 className="mt-1 text-xl font-black">Eski cold walk-in’ler</h2><p className="mt-2 text-sm leading-6 text-slate-500">İşletme adını, saha sahibini, sonucu ve notları buradan güncelle.</p></div><span className="shrink-0 text-xs text-slate-400">{walkIns.length} kayıt</span></div>{walkIns.length === 0 ? <div className={`${panelClass} text-center text-sm text-slate-500`}>Henüz cold walk-in kaydı yok.</div> : <div className="grid gap-3 lg:grid-cols-2">{walkIns.map((item) => <WalkInRow key={item.id} item={item} members={members} onChange={updateWalkIn} />)}</div>}</section>;
}
