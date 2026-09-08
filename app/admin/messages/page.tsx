import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { eyebrowClass, panelClass } from "@/lib/ui";
export const metadata: Metadata = { title: "İletişim mesajları | Yönetim", robots: { index: false, follow: false } };
const formatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });
export default async function MessagesPage() { await requireSession(); const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }); return <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><AdminHeader eyebrow="Gelen kutusu" title="İletişim mesajları" description="Ana siteden gönderilen talepleri incele."><AdminLogoutButton /></AdminHeader><AdminNav active="messages" /><section className={`${panelClass} mt-6`}><div className="mb-5 flex justify-between"><div><p className={eyebrowClass}>En yeni mesajlar</p><h2 className="mt-1 text-xl font-black">Talepler</h2></div><span className="text-xs text-slate-400">{messages.length} mesaj</span></div><div className="grid gap-3">{messages.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex justify-between gap-3"><div><h3 className="font-black">{item.name}</h3><p className="mt-1 text-sm font-semibold text-emerald-700">{item.contact}</p></div><time className="text-xs text-slate-400">{formatter.format(item.createdAt)}</time></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.message}</p></article>)}{messages.length === 0 ? <p className="py-12 text-center text-sm text-slate-400">Henüz mesaj yok.</p> : null}</div></section></div></main>; }
