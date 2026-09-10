"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminRole } from "@/components/admin-access-context";

export type AdminSection = "reviews" | "walkIns" | "transactions" | "finance" | "leads" | "qr" | "profiles" | "stock" | "messages";
const links: Array<{ active: AdminSection; href: string; label: string }> = [
  { active: "reviews", href: "/admin", label: "Yorum & Saha" },
  { active: "walkIns", href: "/admin/walk-ins", label: "Cold walk-in" },
  { active: "transactions", href: "/admin/transactions", label: "Gelir Gider" },
  { active: "finance", href: "/admin/finance", label: "Analiz" },
  { active: "leads", href: "/admin/leads", label: "Takipler" },
  { active: "qr", href: "/admin/qr", label: "QR" },
  { active: "profiles", href: "/admin/profiles", label: "Profil kartları" },
  { active: "stock", href: "/admin/stock", label: "Stok" },
  { active: "messages", href: "/admin/messages", label: "Mesajlar" },
];

function sectionForPath(pathname: string): AdminSection { if (pathname === "/admin") return "reviews"; return links.find((link) => link.href !== "/admin" && pathname.startsWith(link.href))?.active ?? "reviews"; }

export function AdminNav({ active }: { active?: AdminSection }) {
  const pathname = usePathname();
  const role = useAdminRole();
  const visibleLinks = role === "REVIEW_AGENT" ? links.filter((link) => link.active === "reviews") : links;
  const current = active ?? sectionForPath(pathname);
  const currentLabel = links.find((link) => link.active === current)?.label ?? "Yönetim";
  return <nav aria-label="Yönetim bölümleri" className="border-b border-slate-200">
    <div className="hidden h-12 gap-0.5 overflow-x-auto sm:flex">{visibleLinks.map((link) => <Link key={link.active} href={link.href} prefetch className={`inline-flex h-full items-center border-b-2 px-3 text-[0.7rem] font-extrabold whitespace-nowrap transition ${current === link.active ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-400 hover:bg-white/60 hover:text-slate-700"}`}>{link.label}</Link>)}</div>
    <details className="group relative mb-3 sm:hidden"><summary className="flex h-10 cursor-pointer list-none items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 shadow-sm [&::-webkit-details-marker]:hidden"><span>{currentLabel}</span><span className="text-slate-400 transition group-open:rotate-180">⌄</span></summary><div className="absolute inset-x-0 top-12 z-40 grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">{visibleLinks.map((link) => <Link key={link.active} href={link.href} prefetch className={`rounded-xl px-3 py-2.5 text-xs font-extrabold ${current === link.active ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50"}`}>{link.label}</Link>)}</div></details>
  </nav>;
}
