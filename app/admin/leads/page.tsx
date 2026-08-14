import type { Metadata } from "next";
import { addLeadAction } from "@/app/lead-actions";
import { AdminNav } from "@/components/admin-nav";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { DeleteLeadButton } from "@/components/delete-lead-button";
import { EditLeadModal } from "@/components/edit-lead-modal";
import { LeadForm } from "@/components/lead-form";
import { requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { emptyStateClass, eyebrowClass, panelClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Takipler | Yönetim",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

const leadTypeLabels = {
  MESSAGE: "Mesaj",
  CALL: "Arama",
  MAIL: "Mail",
  ORDER: "Sipariş",
} as const;

export default async function LeadsPage() {
  const session = await requireSession();
  const leads = await prisma.lead.findMany({
    where: { userId: session.user.id },
    orderBy: [{ followUpAt: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={eyebrowClass}>Takip listesi</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Takipler</h1>
            <p className="mt-2 text-sm text-slate-500">Mesaj, arama, mail ve siparişleri tek yerde takip et.</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <AdminLogoutButton />
          </div>
        </header>

        <AdminNav active="leads" />

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
          <section className={`${panelClass} h-fit`}>
            <div className="mb-6">
              <p className={eyebrowClass}>Takip listesi</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Yeni takip</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Bir kişiyi, iletişim bilgisini, takip tarihini ve notlarını kaydet.</p>
            </div>
            <LeadForm action={addLeadAction} />
          </section>

          <section className={panelClass}>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className={eyebrowClass}>Takip listesi</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Kayıtlı takipler</h2>
              </div>
              <span className="text-xs font-medium text-slate-400">En yeni 100</span>
            </div>
            {leads.length === 0 ? (
              <div className={emptyStateClass}><p className="font-bold text-slate-700">Henüz takip yok</p><p className="mt-1 text-sm text-slate-400">Soldaki formdan ilk takibini ekleyebilirsin.</p></div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <li key={lead.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="break-words text-sm font-black text-slate-800">{lead.personName}</p>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.65rem] font-black text-slate-500">{leadTypeLabels[lead.type]}</span>
                        </div>
                        {lead.contactInfo ? <p className="mt-1 break-words text-xs text-slate-500">{lead.contactInfo}</p> : null}
                        {lead.followUpAt ? <p className="mt-2 text-xs font-bold text-amber-700">Takip: {dateFormatter.format(lead.followUpAt)}</p> : null}
                        {lead.details ? <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">{lead.details}</p> : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <EditLeadModal lead={{ id: lead.id, type: lead.type, personName: lead.personName, contactInfo: lead.contactInfo, followUpAt: lead.followUpAt?.toISOString().slice(0, 10) ?? "", details: lead.details }} />
                        <DeleteLeadButton id={lead.id} personName={lead.personName} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
