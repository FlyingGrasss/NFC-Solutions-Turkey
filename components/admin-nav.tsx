import Link from "next/link";

export function AdminNav({ active }: { active: "overview" | "leads" | "profiles" | "stock" }) {
  return (
    <nav className="flex h-12 gap-1.5 overflow-x-auto border-b border-slate-200" aria-label="Yönetim bölümleri">
      <Link href="/admin" prefetch className={`inline-flex h-full items-center border-b-2 px-4 text-xs font-extrabold whitespace-nowrap transition ${active === "overview" ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-400 hover:bg-white/60 hover:text-slate-700"}`}>
        Gelir Gider
      </Link>
      <Link href="/admin/profiles" prefetch className={`inline-flex h-full items-center border-b-2 px-4 text-xs font-extrabold whitespace-nowrap transition ${active === "profiles" ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-400 hover:bg-white/60 hover:text-slate-700"}`}>
        Profil kartları
      </Link>
      <Link href="/admin/leads" prefetch className={`inline-flex h-full items-center border-b-2 px-4 text-xs font-extrabold whitespace-nowrap transition ${active === "leads" ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-400 hover:bg-white/60 hover:text-slate-700"}`}>
        Takipler
      </Link>
      <Link href="/admin/stock" prefetch className={`inline-flex h-full items-center border-b-2 px-4 text-xs font-extrabold whitespace-nowrap transition ${active === "stock" ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-400 hover:bg-white/60 hover:text-slate-700"}`}>
        Stok
      </Link>
    </nav>
  );
}
