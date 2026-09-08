import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { QrCodeGenerator } from "@/components/qr-code-generator";
import { requireSession } from "@/lib/auth-helpers";
import { panelClass } from "@/lib/ui";
export const metadata: Metadata = { title: "QR oluşturucu | Yönetim", robots: { index: false, follow: false } };
export default async function QrPage() { await requireSession(); return <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><AdminHeader eyebrow="Bağlantı araçları" title="QR oluşturucu" description="İstediğin herhangi bir bağlantı için QR kod oluştur."><AdminLogoutButton /></AdminHeader><AdminNav active="qr" /><section className={`${panelClass} mt-6`}><QrCodeGenerator initialValue="" /></section></div></main>; }
