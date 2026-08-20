import Link from "next/link";

type AdminSection = "overview" | "leads" | "profiles" | "stock";

const links: Array<{ active: AdminSection; href: string; tab: string; label: string }> = [
  { active: "overview", href: "/admin", tab: "gelir-gider", label: "Gelir Gider" },
  { active: "profiles", href: "/admin/profiles", tab: "profiller", label: "Profil kartları" },
  { active: "leads", href: "/admin/leads", tab: "takipler", label: "Takipler" },
  { active: "stock", href: "/admin/stock", tab: "stok", label: "Stok" },
];

export function AdminNav({ active }: { active: AdminSection }) {
  return (
    <nav className="flex h-12 gap-1.5 overflow-x-auto border-b border-slate-200" aria-label="Yönetim bölümleri">
      {links.map((link) => (
        <Link
          key={link.active}
          href={`${link.href}?tab=${link.tab}`}
          prefetch
          className={`inline-flex h-full items-center border-b-2 px-4 text-xs font-extrabold whitespace-nowrap transition ${active === link.active ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-400 hover:bg-white/60 hover:text-slate-700"}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
