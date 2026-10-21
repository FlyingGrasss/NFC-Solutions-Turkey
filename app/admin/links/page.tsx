import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { ShortLinkManager } from "@/components/short-link-manager";
import { requireAdminMember } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Kısa bağlantılar | Yönetim",
  robots: { index: false, follow: false },
};

export default async function ShortLinksPage() {
  await requireAdminMember();
  const links = await prisma.shortLink.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <AdminHeader eyebrow="Bağlantı araçları" title="Kısa bağlantılar" description="Kısa kodlar oluştur, hedeflerini güncelle ve paylaşılabilir bağlantıları yönet.">
          <AdminLogoutButton />
        </AdminHeader>
        <AdminNav active="shortLinks" />
        <ShortLinkManager
          links={links.map((link) => ({
            id: link.id,
            slug: link.slug,
            targetUrl: link.targetUrl,
            createdAt: link.createdAt.toISOString(),
            updatedAt: link.updatedAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}
