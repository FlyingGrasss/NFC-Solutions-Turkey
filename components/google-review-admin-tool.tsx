"use client";

import { useRef, useState } from "react";
import { generateGoogleReviewLinkAction } from "@/app/google-review-actions";
import { eyebrowClass, fieldInputClass, fieldLabelClass, panelClass } from "@/lib/ui";

type Member = { id: string; name: string; role: "ADMIN" | "REVIEW_AGENT" };
type NdefReader = { write: (message: { records: Array<{ recordType: "url"; data: string }> }, options?: { signal?: AbortSignal; overwrite?: boolean }) => Promise<void> };
type NdefReaderConstructor = new () => NdefReader;

export function GoogleReviewAdminTool({ currentMember }: { currentMember: Member }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [input, setInput] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [together, setTogether] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nfcStatus, setNfcStatus] = useState<string | null>(null);
  const [nfcSupported] = useState(() => typeof window !== "undefined" && "NDEFReader" in window);

  async function generate(value = input) {
    const clean = value.trim();
    if (!clean || pending) return;
    setPending(true);
    setMessage(null);
    setError(null);
    setNfcStatus(null);
    try {
      const data = new FormData();
      data.set("mapsUrl", clean);
      data.set("together", String(together && currentMember.role === "ADMIN"));
      const result = await generateGoogleReviewLinkAction(data);
      if (result.error || !result.reviewUrl) {
        setError(result.error ?? "Bağlantı oluşturulamadı.");
        return;
      }
      setReviewUrl(result.reviewUrl);
      setMessage(result.duplicate ? "Bu işletme daha önce oluşturuldu." : "İşletme eklendi; yorum bağlantısı hazır.");
    } catch {
      setError("Bağlantı oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  function clear() {
    abortRef.current?.abort();
    setInput("");
    setReviewUrl("");
    setMessage(null);
    setError(null);
    setNfcStatus(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setNfcStatus("Bağlantı kopyalandı.");
    } catch {
      setError("Bağlantı kopyalanamadı.");
    }
  }

  async function writeNfc() {
    if (!reviewUrl) return;
    const Reader = (window as unknown as { NDEFReader?: NdefReaderConstructor }).NDEFReader;
    if (!Reader) return copy();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setNfcStatus("Kartı telefonun arkasına yaklaştırın…");
    try {
      await new Reader().write({ records: [{ recordType: "url", data: reviewUrl }] }, { signal: controller.signal, overwrite: true });
      setNfcStatus("Bağlantı karta yazıldı.");
    } catch (cause) {
      if ((cause as { name?: string }).name !== "AbortError") setError("NFC yazılamadı. Chrome, NFC izni ve kartı kontrol edin.");
    }
  }

  return <section className={`${panelClass} mt-6`}><div className="mb-5"><p className={eyebrowClass}>Google yorumları</p><h2 className="mt-1 text-xl font-black">Yorum bağlantısı oluştur</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Maps bağlantısını yapıştır. Yorum linki hazırlanır ve işletme saha geçmişine eklenir.</p></div><label htmlFor="maps-url" className={fieldLabelClass}>Google Maps bağlantısı veya Place ID</label><div className="flex gap-2"><input ref={inputRef} id="maps-url" value={input} onChange={(event) => setInput(event.target.value)} onPaste={(event) => { const value = event.clipboardData.getData("text"); setInput(value); setTimeout(() => void generate(value), 0); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void generate(); } }} autoFocus placeholder="https://maps.app.goo.gl/..." className={`${fieldInputClass} min-w-0 flex-1`} /><button type="button" onClick={clear} className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">Temizle</button><button type="button" onClick={() => void generate()} disabled={pending || !input.trim()} className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{pending ? "Hazırlanıyor…" : "Oluştur"}</button></div>{reviewUrl ? <div className="mt-4"><label className={fieldLabelClass}>Doğrudan yorum bağlantısı</label><div className="flex flex-col gap-2 sm:flex-row"><input readOnly value={reviewUrl} className={fieldInputClass} /><button type="button" onClick={nfcSupported ? writeNfc : copy} className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white">{nfcSupported ? "NFC’ye yaz" : "Kopyala"}</button></div></div> : null}<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><div>{message ? <p className="text-xs font-bold text-emerald-700">{message}</p> : null}{nfcStatus ? <p className="text-xs font-bold text-emerald-700">{nfcStatus}</p> : null}{error ? <p className="text-xs font-bold text-rose-600">{error}</p> : null}</div>{currentMember.role === "ADMIN" ? <label className="flex items-center gap-2 text-xs font-black text-slate-600"><input type="checkbox" checked={together} onChange={(event) => setTogether(event.target.checked)} />Birlikte saha modu</label> : null}</div></section>;
}
