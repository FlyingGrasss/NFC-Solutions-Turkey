import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { emptyStateClass, eyebrowClass, panelClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Profil kartları | Yönetim",
  robots: { index: false, follow: false },
};

export default async function ProfilesPage() {
  await requireSession();
  const profiles = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { facilities: true } } },
  });

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <AdminHeader eyebrow="Yönetim" title="Profil kartları" description="Kişisel link kartlarını buradan oluştur ve yönet.">
          <div className="order-1 sm:order-2"><AdminLogoutButton /></div>
          <Link href="/admin/profiles/new" className="order-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700 sm:order-1">+ Yeni profil</Link>
        </AdminHeader>

        <AdminNav active="profiles" />

        {profiles.length === 0 ? (
          <section className={`${panelClass} mt-6`}>
            <div className={emptyStateClass}>
              <p className="font-bold text-slate-700">Henüz profil kartı yok</p>
              <p className="mt-1 text-sm text-slate-400">İlk kartı oluşturarak /slug adresini yayınlayabilirsin.</p>
            </div>
          </section>
        ) : (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            {profiles.map((profile) => (
              <article key={profile.id} className={panelClass}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`${eyebrowClass} tracking-normal`}>/{profile.slug.toLowerCase()}</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">{profile.name}</h2>
                    {profile.title ? <p className="mt-1 text-sm text-slate-500">{profile.title}</p> : null}
                    <p className="mt-3 text-xs text-slate-400">{profile._count.facilities} bağlantı</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Aktif</span>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/admin/profiles/${profile.id}`} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700">Düzenle</Link>
                  <Link href={`/${profile.slug}`} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Herkese açık sayfa ↗</Link>
                  <Link href={`/${profile.slug}/admin`} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Profil yönetimi ↗</Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
