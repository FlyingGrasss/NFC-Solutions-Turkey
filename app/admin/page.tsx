import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { GoogleReviewAdminTool } from "@/components/google-review-admin-tool";
import { requireMember, requireSession } from "@/lib/auth-helpers";

export const metadata: Metadata = { title: "Yorum bağlantısı ve saha | Yönetim", robots: { index: false, follow: false } };
export default async function AdminPage() {
  await requireSession();
  const currentMember = await requireMember();
  return <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><AdminHeader eyebrow="Saha araçları" title="Yorum bağlantısı" description="Bağlantıyı oluştur, karta yaz ve yeni cold walk-in kaydı aç."><AdminLogoutButton /></AdminHeader><AdminNav active="reviews" /><GoogleReviewAdminTool currentMember={currentMember} /></div></main>;
}
