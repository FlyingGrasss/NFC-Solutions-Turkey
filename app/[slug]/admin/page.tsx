import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileEditorForm } from "@/components/profile-editor-form";
import { ProfileLoginForm } from "@/components/profile-login-form";
import {
  signOutProfileAction,
  updateOwnedProfileAction,
} from "@/app/profile-actions";
import { prisma } from "@/lib/db";
import { getProfileAdmin } from "@/lib/profile-auth";
import { normalizeProfileColorScheme } from "@/lib/profile";
import { eyebrowClass, panelClass } from "@/lib/ui";

type ProfileAdminPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProfileAdminPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({
    where: { slug },
    select: { name: true },
  });

  return {
    title: profile ? `${profile.name} yönetimi` : "Profil yönetimi",
    robots: { index: false, follow: false },
  };
}

export default async function ProfileAdminPage({ params }: ProfileAdminPageProps) {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({
    where: { slug },
    include: {
      facilities: { orderBy: { sortOrder: "asc" } },
      customButtons: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!profile) {
    notFound();
  }

  const authorizedProfile = await getProfileAdmin(slug);

  if (!authorizedProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#031727] p-5">
        <ProfileLoginForm slug={slug} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7f5] p-5 sm:p-8">
      <div className="mx-auto w-full max-w-[58rem]">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={eyebrowClass}>Profil yönetimi</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{profile.name}</h1>
            <Link href={`/${profile.slug}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-emerald-700 hover:underline">
              Herkese açık profili aç ↗
            </Link>
          </div>
          <form action={signOutProfileAction}>
            <button type="submit" className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-slate-900">Çıkış yap</button>
          </form>
        </header>
        <section className={panelClass}>
          <ProfileEditorForm
            action={updateOwnedProfileAction}
            mode="owner-edit"
            profile={{ ...profile, colorScheme: normalizeProfileColorScheme(profile.colorScheme) }}
          />
        </section>
      </div>
    </main>
  );
}
