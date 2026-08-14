import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { ProfileEditorForm } from "@/components/profile-editor-form";
import { updateProfileAction } from "@/app/profile-actions";
import { requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { normalizeProfileColorScheme } from "@/lib/profile";
import { eyebrowClass, panelClass } from "@/lib/ui";

type EditProfilePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id }, select: { name: true } });
  return {
    title: profile ? `${profile.name} düzenle | Yönetim` : "Profil düzenle | Yönetim",
    robots: { index: false, follow: false },
  };
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  await requireSession();
  const { id } = await params;
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      facilities: { orderBy: { sortOrder: "asc" } },
      customButtons: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <AdminNav active="profiles" />
        <header className="my-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={eyebrowClass}>Profil kartları</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{profile.name} düzenle</h1>
          </div>
          <Link href={`/${profile.slug}`} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-white">Herkese açık sayfa ↗</Link>
        </header>
        <section className={panelClass}>
          <ProfileEditorForm
            action={updateProfileAction}
            mode="master-edit"
            profile={{ ...profile, colorScheme: normalizeProfileColorScheme(profile.colorScheme) }}
          />
        </section>
      </div>
    </main>
  );
}
