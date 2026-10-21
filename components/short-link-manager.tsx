"use client";

import { useActionState, useState } from "react";
import { createShortLinkAction, deleteShortLinkAction, updateShortLinkAction, type ShortLinkFormState } from "@/app/short-link-actions";
import { useModalScrollLock } from "@/components/use-modal-scroll-lock";
import { siteUrl } from "@/lib/site";
import { emptyStateClass, eyebrowClass, fieldInputClass, fieldLabelClass, modalBackdropClass, modalCardClass, panelClass } from "@/lib/ui";

export type ShortLinkItem = {
  id: string;
  slug: string;
  targetUrl: string;
  createdAt: string;
  updatedAt: string;
};

const initialState: ShortLinkFormState = {};
const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

function shortLinkUrl(slug: string) {
  return `${siteUrl}/r/${slug}`;
}

function FormMessage({ state }: { state: ShortLinkFormState }) {
  if (state.error) return <p role="alert" className="text-xs font-semibold text-rose-600">{state.error}</p>;
  if (state.success) return <p role="status" className="text-xs font-semibold text-emerald-700">{state.success}</p>;
  return null;
}

function NewShortLinkForm() {
  const [state, formAction, pending] = useActionState(createShortLinkAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="short-link-slug" className={fieldLabelClass}>Kısa kod</label>
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
          <span className="pl-3.5 text-sm font-bold text-slate-400">/r/</span>
          <input id="short-link-slug" name="slug" required maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="kartvizit" className="h-12 min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
        </div>
        <p className="mt-1.5 text-xs text-slate-400">Küçük harf, rakam ve ara çizgi kullan.</p>
      </div>
      <div>
        <label htmlFor="short-link-target" className={fieldLabelClass}>Hedef bağlantısı</label>
        <input id="short-link-target" name="targetUrl" required type="url" maxLength={2000} placeholder="https://www.nfcsolutions.com.tr/..." className={fieldInputClass} />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white transition hover:bg-slate-700 disabled:opacity-60">{pending ? "Oluşturuluyor…" : "Kısa bağlantı oluştur"}</button>
    </form>
  );
}

function CopyShortLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return <button type="button" onClick={copy} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-900">{copied ? "Kopyalandı" : "Kopyala"}</button>;
}

function ShortLinkEditor({ link }: { link: ShortLinkItem }) {
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState(link.slug);
  const [targetUrl, setTargetUrl] = useState(link.targetUrl);
  useModalScrollLock(open);

  const [state, formAction, pending] = useActionState(async (previousState: ShortLinkFormState, formData: FormData) => {
    const result = await updateShortLinkAction(previousState, formData);
    if (result.success) setOpen(false);
    return result;
  }, initialState);

  function openEditor() {
    setSlug(link.slug);
    setTargetUrl(link.targetUrl);
    setOpen(true);
  }

  return (
    <>
      <button type="button" onClick={openEditor} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-900">Düzenle</button>
      {open ? (
        <div className={modalBackdropClass} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section className={`${modalCardClass} max-w-lg`} role="dialog" aria-modal="true" aria-labelledby={`short-link-edit-title-${link.id}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={eyebrowClass}>Kısa bağlantı</p>
                <h2 id={`short-link-edit-title-${link.id}`} className="mt-1 text-xl font-black text-slate-950">Bağlantıyı düzenle</h2>
              </div>
              <button type="button" aria-label="Pencereyi kapat" onClick={() => setOpen(false)} className="rounded-xl px-3 py-1 text-2xl leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-700">×</button>
            </div>
            <form action={formAction} className="mt-6 space-y-4">
              <input type="hidden" name="id" value={link.id} />
              <div>
                <label htmlFor={`short-link-edit-slug-${link.id}`} className={fieldLabelClass}>Kısa kod</label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <span className="pl-3.5 text-sm font-bold text-slate-400">/r/</span>
                  <input id={`short-link-edit-slug-${link.id}`} name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} required maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="h-12 min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-900 outline-none" />
                </div>
              </div>
              <div>
                <label htmlFor={`short-link-edit-target-${link.id}`} className={fieldLabelClass}>Hedef bağlantısı</label>
                <input id={`short-link-edit-target-${link.id}`} name="targetUrl" value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} required type="url" maxLength={2000} className={fieldInputClass} />
              </div>
              <FormMessage state={state} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">İptal</button>
                <button type="submit" disabled={pending} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

function DeleteShortLinkButton({ link }: { link: ShortLinkItem }) {
  const [open, setOpen] = useState(false);
  useModalScrollLock(open);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50">Sil</button>
      {open ? (
        <div className={modalBackdropClass} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section className={`${modalCardClass} max-w-md`} role="dialog" aria-modal="true" aria-labelledby={`short-link-delete-title-${link.id}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`${eyebrowClass} text-rose-600`}>Kısa bağlantıyı sil</p>
                <h2 id={`short-link-delete-title-${link.id}`} className="mt-1 text-xl font-black text-slate-950">Emin misiniz?</h2>
              </div>
              <button type="button" aria-label="Pencereyi kapat" onClick={() => setOpen(false)} className="rounded-xl px-3 py-1 text-2xl leading-none text-slate-300 transition hover:bg-slate-100 hover:text-slate-700">×</button>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-500"><span className="font-bold text-slate-800">/r/{link.slug}</span> bağlantısı silinecek ve artık yönlendirme yapmayacak.</p>
            <form action={deleteShortLinkAction} className="mt-7 flex gap-3">
              <input type="hidden" name="id" value={link.id} />
              <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50">Vazgeç</button>
              <button type="submit" className="flex-1 rounded-2xl bg-rose-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-rose-700">Evet, sil</button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

export function ShortLinkManager({ links }: { links: ShortLinkItem[] }) {
  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)]">
      <section className={`${panelClass} h-fit`}>
        <div className="mb-6">
          <p className={eyebrowClass}>Yeni bağlantı</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Kısa URL oluştur</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Örneğin /r/kartvizit gibi kısa bir adres oluşturup istediğin hedefe yönlendir.</p>
        </div>
        <NewShortLinkForm />
      </section>

      <section className={panelClass}>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className={eyebrowClass}>Yönetilen bağlantılar</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Kısa URL listesi</h2>
          </div>
          <span className="text-xs font-medium text-slate-400">{links.length} bağlantı</span>
        </div>
        {links.length === 0 ? (
          <div className={emptyStateClass}>
            <p className="font-bold text-slate-700">Henüz kısa bağlantı yok</p>
            <p className="mt-1 text-sm text-slate-400">Soldaki formdan ilk kısa URL’ni oluşturabilirsin.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {links.map((link) => {
              const url = shortLinkUrl(link.slug);
              return (
                <article key={link.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <a href={url} target="_blank" rel="noreferrer" className={`${eyebrowClass} break-all tracking-normal hover:text-emerald-800`}>{url.replace(/^https?:\/\//, "")}</a>
                      <a href={link.targetUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm font-semibold leading-6 text-slate-600 hover:text-emerald-700">{link.targetUrl}</a>
                      <p className="mt-2 text-xs text-slate-400">Son güncelleme: {dateFormatter.format(new Date(link.updatedAt))}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <CopyShortLinkButton url={url} />
                      <ShortLinkEditor link={link} />
                      <DeleteShortLinkButton link={link} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
