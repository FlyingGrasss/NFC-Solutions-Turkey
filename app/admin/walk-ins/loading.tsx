import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { eyebrowClass, panelClass } from "@/lib/ui";

function Pulse({ className = "h-4 w-24" }: { className?: string }) {
  return <span className={`inline-block animate-pulse rounded bg-slate-200 ${className}`} />;
}

export default function Loading() {
  return <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><AdminHeader eyebrow="Saha araçları" title="Cold walk-in geçmişi" description="Eski saha kayıtlarını, sonuçlarını ve notlarını yönet."><AdminLogoutButton /></AdminHeader><AdminNav active="walkIns" /><section className="mt-6"><div className="mb-4"><p className={eyebrowClass}>Saha geçmişi</p><h2 className="mt-1 text-xl font-black">Eski cold walk-in’ler</h2></div><div className="grid gap-3 lg:grid-cols-2">{[0, 1, 2, 3].map((item) => <div key={item} className={`${panelClass} h-48`}><Pulse className="h-5 w-2/5" /><Pulse className="mt-3 h-3 w-1/2" /><div className="mt-6 h-10 rounded-xl bg-slate-100" /><div className="mt-3 h-10 rounded-xl bg-slate-100" /></div>)}</div></section></div></main>;
}
