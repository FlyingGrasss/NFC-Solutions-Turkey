import type { Metadata } from "next";
import { addLeadAction } from "@/app/lead-actions";
import { AdminNav } from "@/components/admin-nav";
import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { DeleteLeadButton } from "@/components/delete-lead-button";
import { EditLeadModal } from "@/components/edit-lead-modal";
import { LeadForm } from "@/components/lead-form";
import { WalkInAnalytics } from "@/components/walk-in-analytics";
import { WalkInForm } from "@/components/walk-in-form";
import { requireMember, requireSession } from "@/lib/auth-helpers";
import { getPartnerMembers } from "@/lib/finance";
import { prisma } from "@/lib/db";
import { emptyStateClass, eyebrowClass, panelClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Takipler | Yönetim",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });
const stageLabels: Record<string, string> = {
  UNCLASSIFIED: "Sınıflandırılmadı",
  REFUSED: "Reddetti",
  DECISION_MAKER_ABSENT: "Yetkili yok",
  STAFF_LIKED: "Çalışan beğendi",
  STAFF_EXPECTS_BOSS_INTEREST: "Patron beğenebilir",
  FOLLOW_UP_REQUESTED: "Tekrar gel",
  ORDER_INTENT: "İletişim / sipariş niyeti",
  ORDER_CONFIRMED: "Sipariş kesinleşti",
};
const sourceLabels: Record<string, string> = { COLD_WALK_IN: "Cold walk-in", MESSAGE: "Mesaj", CALL: "Arama", MAIL: "Mail", OTHER: "Diğer" };

function todayInIstanbul() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export default async function LeadsPage() {
  const session = await requireSession();
  const currentMember = await requireMember();
  const [leads, visits, allMembers] = await Promise.all([
    prisma.lead.findMany({
      where: { userId: session.user.id },
      include: { visits: { include: { member: { select: { name: true } } }, orderBy: { occurredAt: "desc" }, take: 5 }, _count: { select: { visits: true } } },
      orderBy: [{ followUpAt: "asc" }, { updatedAt: "desc" }],
      take: 200,
    }),
    prisma.leadVisit.findMany({
      where: { userId: session.user.id },
      include: { lead: { select: { personName: true } }, member: { select: { name: true } } },
      orderBy: { occurredAt: "desc" },
      take: 1000,
    }),
    prisma.member.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const members = getPartnerMembers(allMembers);
  const analyticsVisits = visits.map((visit) => ({ id: visit.id, leadId: visit.leadId, businessName: visit.lead.personName, stage: visit.stage, occurredAt: visit.occurredAt.toISOString(), memberId: visit.memberId, memberName: visit.member.name }));

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <AdminHeader eyebrow="Takip listesi" title="Takipler" description="Sahadaki ziyaretleri, takipleri ve siparişleri hızlıca yönet.">
          <div className="order-1 sm:order-2"><AdminLogoutButton /></div>
        </AdminHeader>
        <AdminNav active="leads" />

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
          <section className={`${panelClass} h-fit`}>
            <div className="mb-6"><p className={eyebrowClass}>Saha modu</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Yeni cold walk-in</h2><p className="mt-2 text-sm leading-6 text-slate-500">İşletme adını yaz, sonucu seç ve yenisine geç.</p></div>
            <WalkInForm members={members} currentMemberId={currentMember.id} defaultDate={todayInIstanbul()} businessSuggestions={leads.filter((lead) => lead.source === "COLD_WALK_IN").map((lead) => lead.personName)} />
            <details className="mt-6 border-t border-slate-100 pt-5"><summary className="cursor-pointer text-sm font-black text-slate-700">Genel takip ekle</summary><div className="mt-5"><LeadForm action={addLeadAction} /></div></details>
          </section>

          <section className={panelClass}>
            <div className="mb-5 flex items-end justify-between gap-4"><div><p className={eyebrowClass}>Takip edilecekler</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">İşletmeler</h2></div><span className="text-xs font-medium text-slate-400">En yeni 200</span></div>
            {leads.length === 0 ? <div className={emptyStateClass}><p className="font-bold text-slate-700">Henüz takip yok</p><p className="mt-1 text-sm text-slate-400">Saha modundan ilk ziyaretini ekleyebilirsin.</p></div> : <ul className="divide-y divide-slate-100">{leads.map((lead) => { const latestVisit = lead.visits[0]; const sourceLabel = lead.source === "OTHER" ? ({ MESSAGE: "Mesaj", CALL: "Arama", MAIL: "Mail", ORDER: "Sipariş" }[lead.type] ?? "Diğer") : sourceLabels[lead.source] ?? sourceLabels.OTHER; return <li key={lead.id} className="py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="break-words text-sm font-black text-slate-800">{lead.personName}</p><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.65rem] font-black text-emerald-700">{stageLabels[lead.stage]}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.65rem] font-black text-slate-500">{sourceLabel}</span></div>{lead.contactInfo ? <p className="mt-1 break-words text-xs text-slate-500">{lead.contactInfo}</p> : null}{lead.followUpAt ? <p className="mt-2 text-xs font-bold text-amber-700">Takip: {dateFormatter.format(lead.followUpAt)}</p> : null}<p className="mt-2 text-xs text-slate-400">{lead._count.visits ? `${lead._count.visits} ziyaret · Sonuç: ${latestVisit ? stageLabels[latestVisit.stage] : "-"}` : "Eski kayıt · istatistiklere dahil değil"}</p>{lead.details ? <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">{lead.details}</p> : null}</div><div className="flex shrink-0 items-center gap-3"><EditLeadModal lead={{ id: lead.id, type: lead.type, personName: lead.personName, contactInfo: lead.contactInfo, followUpAt: lead.followUpAt?.toISOString().slice(0, 10) ?? "", details: lead.details }} /><DeleteLeadButton id={lead.id} personName={lead.personName} /></div></div></li>; })}</ul>}
          </section>
        </section>

        <div className="mt-6"><WalkInAnalytics visits={analyticsVisits} members={members} /></div>
      </div>
    </main>
  );
}
