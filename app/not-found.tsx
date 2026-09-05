import Link from "next/link";
import type { Metadata } from "next";
import { FaArrowLeft } from "react-icons/fa6";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "404 | Sayfa bulunamadı",
  description: "Aradığınız sayfa bulunamadı.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-svh overflow-hidden bg-[#071512] px-6 py-8 text-[#f4f8f2] sm:px-12 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 -z-10 h-96 w-96 rounded-full bg-[#51d48d]/15 blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-[#258e64]/15 blur-[100px]" />

      <div className="mx-auto flex w-full max-w-[75rem] flex-1 flex-col">
        <Link href="/" aria-label="NFC Solutions Turkey ana sayfa" className="self-start transition-opacity hover:opacity-80">
          <BrandLogo className="h-12 max-w-[18rem]" />
        </Link>

        <section className="flex flex-1 items-center py-24">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2.5 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#80d89e]"><span className="block h-px w-7 bg-[#75d49a]" /> 404 · Sayfa bulunamadı</p>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-[0.005em] text-[#f5faf4] sm:text-8xl">Aradığınız sayfa<br /><em className="font-light tracking-[0.01em] text-[#8ce0ac]">burada değil.</em></h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#d5efd9]/60">Bu bağlantı kaldırılmış, değiştirilmiş veya hiç oluşturulmamış olabilir.</p>
            <Link href="/" className="mt-8 inline-flex min-h-13 items-center gap-3 rounded-full bg-[#a5efbd] px-5 py-3 text-xs font-extrabold text-[#0b2718] shadow-[0_10px_30px_rgb(105_228_146_/_0.14)] transition hover:-translate-y-0.5 hover:bg-[#c2f8d1]"><FaArrowLeft /> Ana sayfaya dön</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
