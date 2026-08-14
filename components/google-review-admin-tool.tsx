"use client";

import { useState } from "react";
import { generateGoogleReviewLinkAction } from "@/app/google-review-actions";
import { eyebrowClass, fieldInputClass, fieldLabelClass } from "@/lib/ui";

export function GoogleReviewAdminTool() {
  const [mapsUrl, setMapsUrl] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function generateLink() {
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("mapsUrl", mapsUrl);
      const result = await generateGoogleReviewLinkAction(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.reviewUrl) {
        setReviewUrl(result.reviewUrl);
        setMessage(
          result.placeName
            ? `${result.placeName} için yorum bağlantısı hazır.`
            : "Yorum bağlantısı hazır.",
        );
      }
    } catch {
      setError("Bağlantı oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  async function copyLink() {
    if (!reviewUrl) return;

    try {
      await navigator.clipboard.writeText(reviewUrl);
      setMessage("Bağlantı panoya kopyalandı.");
      setError(null);
    } catch {
      setError("Bağlantı kopyalanamadı.");
      setMessage(null);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <p className={eyebrowClass}>Google yorumları</p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
          Yorum bağlantısı oluştur
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Google Maps işletme bağlantısını yapıştırın; yorum bağlantısını oluşturup kopyalayın.
        </p>
      </div>

      <div>
        <label htmlFor="google-review-maps-url" className={fieldLabelClass}>
          Google Maps bağlantısı
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="google-review-maps-url"
            type="url"
            value={mapsUrl}
            onChange={(event) => setMapsUrl(event.target.value)}
            placeholder="https://maps.app.goo.gl/..."
            className={fieldInputClass}
          />
          <button
            type="button"
            onClick={generateLink}
            disabled={pending}
            className="shrink-0 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {pending ? "Hazırlanıyor…" : "Bağlantı oluştur"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="google-review-url" className={fieldLabelClass}>
          Oluşturulan yorum bağlantısı
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="google-review-url"
            type="url"
            value={reviewUrl}
            onChange={(event) => setReviewUrl(event.target.value)}
            placeholder="Bağlantı burada görünür"
            className={fieldInputClass}
          />
          <button
            type="button"
            onClick={copyLink}
            disabled={!reviewUrl}
            className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
          >
            Kopyala
          </button>
        </div>
      </div>

      {message ? <p className="mt-3 text-xs font-semibold text-emerald-700">{message}</p> : null}
      {error ? <p role="alert" className="mt-3 text-xs font-semibold text-rose-600">{error}</p> : null}
    </div>
  );
}
