"use client";

import { useMemo, useState } from "react";

type AnalyticsVisit = {
  id: string;
  leadId: string;
  businessName: string;
  stage: string;
  occurredAt: string;
  memberId: string;
  memberName: string;
};

const labels: Record<string, string> = {
  REFUSED: "Reddetti",
  DECISION_MAKER_ABSENT: "Yetkili yok",
  STAFF_LIKED: "Çalışan beğendi",
  STAFF_EXPECTS_BOSS_INTEREST: "Patron beğenebilir",
  FOLLOW_UP_REQUESTED: "Tekrar gel",
  ORDER_INTENT: "İletişim / niyet",
  ORDER_CONFIRMED: "Sipariş kesinleşti",
};

const ranges = [
  { value: "today", label: "Bugün" },
  { value: "7", label: "7 gün" },
  { value: "30", label: "30 gün" },
  { value: "all", label: "Tümü" },
] as const;

function percent(value: number, total: number) {
  return total ? `${Math.round((value / total) * 100)}%` : "0%";
}

export function WalkInAnalytics({ visits, members }: { visits: AnalyticsVisit[]; members: Array<{ id: string; name: string }> }) {
  const [range, setRange] = useState<(typeof ranges)[number]["value"]>("all");
  const [memberId, setMemberId] = useState("all");
  const [currentTime] = useState(() => Date.now());
  const filtered = useMemo(() => {
    const today = new Date(currentTime);
    today.setHours(0, 0, 0, 0);
    const since = range === "all" ? 0 : range === "today" ? today.getTime() : currentTime - Number(range) * 86_400_000;
    return visits.filter((visit) => new Date(visit.occurredAt).getTime() >= since && (memberId === "all" || visit.memberId === memberId));
  }, [currentTime, memberId, range, visits]);
  const uniqueBusinesses = new Set(filtered.map((visit) => visit.leadId)).size;
  const count = (stage: string) => filtered.filter((visit) => visit.stage === stage).length;
  const confirmedBusinesses = new Set(filtered.filter((visit) => visit.stage === "ORDER_CONFIRMED").map((visit) => visit.leadId)).size;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_38px_rgb(25_55_36_/_0.05)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-emerald-600">Cold walk-in</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Saha sonuçları</h2></div>
        <div className="flex flex-wrap gap-2"><select value={range} onChange={(event) => setRange(event.target.value as typeof range)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none focus:border-emerald-500">{ranges.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><select value={memberId} onChange={(event) => setMemberId(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 outline-none focus:border-emerald-500"><option value="all">Herkes</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Ziyaret" value={String(filtered.length)} /><Metric label="İşletme" value={String(uniqueBusinesses)} /><Metric label="Red oranı" value={percent(count("REFUSED"), filtered.length)} /><Metric label="Dönüşüm" value={percent(confirmedBusinesses, uniqueBusinesses)} /></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(labels).map(([stage, label]) => <div key={stage} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm"><span className="font-bold text-slate-600">{label}</span><span className="font-black text-slate-900">{count(stage)} <span className="text-xs font-semibold text-slate-400">({percent(count(stage), filtered.length)})</span></span></div>)}</div>
      <p className="mt-4 text-xs leading-5 text-slate-400">Dönüşüm yalnızca kesinleşmiş sipariştir. Ara sonuçlar ayrı tutulur; aynı işletmeye yapılan tekrar ziyaretler ziyaret sayısına eklenir ama işletme sayısını artırmaz.</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></div>;
}
