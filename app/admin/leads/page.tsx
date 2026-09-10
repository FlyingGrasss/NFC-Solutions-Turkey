import type { Metadata } from "next";
import { addLeadAction } from "@/app/lead-actions";
import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";
import { DeleteLeadButton } from "@/components/delete-lead-button";
import { EditLeadModal } from "@/components/edit-lead-modal";
import { LeadForm } from "@/components/lead-form";
import { requireAdminMember, requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { emptyStateClass, eyebrowClass, panelClass } from "@/lib/ui";

export const metadata: Metadata = { title: "Takipler | Yönetim", robots: { index: false, follow: false } };
const formatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });
export default async function LeadsPage() {
  const session = await requireSession();
  await requireAdminMember();
  const leads = await prisma.lead.findMany({ where: { userId: session.user.id, source: { not: "COLD_WALK_IN" } }, orderBy: [{ followUpAt: "asc" }, { updatedAt: "desc" }], take: 200 });
  return <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><AdminHeader eyebrow="Takip listesi" title="Takipler" description="Mesaj, arama, mail ve sipariş takiplerini yönet."><AdminLogoutButton /></AdminHeader><AdminNav active="leads" /><section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)]"><section className={`${panelClass} h-fit`}><p className={eyebrowClass}>Yeni takip</p><h2 className="mt-1 text-xl font-black">Takip ekle</h2><div className="mt-5"><LeadForm action={addLeadAction} /></div></section><section className={panelClass}><div className="mb-5 flex justify-between"><div><p className={eyebrowClass}>Takip edilecekler</p><h2 className="mt-1 text-xl font-black">Kişiler ve işletmeler</h2></div><span className="text-xs text-slate-400">{leads.length} kayıt</span></div>{leads.length === 0 ? <div className={emptyStateClass}>Henüz takip yok.</div> : <ul className="divide-y divide-slate-100">{leads.map((lead) => <li key={lead.id} className="py-4 first:pt-0"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-black text-slate-800">{lead.personName}</p>{lead.contactInfo ? <p className="mt-1 text-sm text-emerald-700">{lead.contactInfo}</p> : null}{lead.followUpAt ? <p className="mt-2 text-xs font-bold text-amber-700">Takip: {formatter.format(lead.followUpAt)}</p> : null}{lead.details ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">{lead.details}</p> : null}</div><div className="flex shrink-0 gap-2"><EditLeadModal lead={{ id: lead.id, type: lead.type, personName: lead.personName, contactInfo: lead.contactInfo, followUpAt: lead.followUpAt?.toISOString().slice(0, 10) ?? "", details: lead.details }} /><DeleteLeadButton id={lead.id} personName={lead.personName} /></div></div></li>)}</ul>}</section></section></div></main>;
}
