"use client";

import QRCode from "qrcode";
import Image from "next/image";
import { useState } from "react";
import { fieldInputClass, fieldLabelClass } from "@/lib/ui";

function normalizeLink(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 4_000) return null;

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    new URL(candidate);
    return candidate;
  } catch {
    return null;
  }
}

export function QrCodeGenerator({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function generateQr() {
    const link = normalizeLink(value);

    if (!link) {
      setDataUrl(null);
      setError("Geçerli bir bağlantı girin.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const qrDataUrl = await QRCode.toDataURL(link, {
        width: 640,
        margin: 3,
        errorCorrectionLevel: "M",
        color: {
          dark: "#09251b",
          light: "#ffffff",
        },
      });

      setValue(link);
      setDataUrl(qrDataUrl);
    } catch {
      setDataUrl(null);
      setError("QR kodu oluşturulamadı. Bağlantıyı kontrol edip tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="border-t border-slate-100 pt-6">
      <div className="mb-4">
        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-emerald-600">Genel QR aracı</p>
        <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950">Herhangi bir bağlantı için QR kodu</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Google yorum bağlantısı, profil, WhatsApp, Instagram veya başka bir bağlantıyı QR koduna dönüştürün.
        </p>
      </div>

      <div>
        <label htmlFor="generic-qr-url" className={fieldLabelClass}>Bağlantı</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="generic-qr-url"
            type="url"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setDataUrl(null);
              setError(null);
            }}
            placeholder="https://nfcsolutions.com.tr/..."
            className={fieldInputClass}
          />
          <button
            type="button"
            onClick={generateQr}
            disabled={pending}
            className="shrink-0 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {pending ? "Hazırlanıyor…" : "QR oluştur"}
          </button>
        </div>
      </div>

      {error ? <p role="alert" className="mt-3 text-xs font-semibold text-rose-600">{error}</p> : null}

      {dataUrl ? (
        <div className="mt-5 flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
          <Image src={dataUrl} alt="Bağlantı için oluşturulan QR kodu" width={192} height={192} unoptimized className="h-48 w-48 rounded-xl bg-white p-2" />
          <div>
            <p className="text-sm font-bold text-slate-800">QR kodu hazır</p>
            <p className="mt-1 max-w-md break-all text-xs leading-5 text-slate-400">{value}</p>
            <a
              href={dataUrl}
              download="nfc-solutions-qr.png"
              className="mt-4 inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              PNG olarak indir
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}
