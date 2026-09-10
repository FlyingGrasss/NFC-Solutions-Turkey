"use client";

import type { MemberOption } from "@/components/payer-picker";

export function SellerCreditPicker({ members, value, onChange }: { members: MemberOption[]; value: string; onChange: (value: string) => void }) {
  return <div className="grid grid-cols-3 gap-2">{members.slice(0, 2).map((member) => <button key={member.id} type="button" aria-pressed={value === member.id} onClick={() => onChange(member.id)} className={value === member.id ? "rounded-xl border-2 border-sky-500 bg-sky-50 px-2 py-2.5 text-sm font-black text-sky-700" : "rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-sm font-bold text-slate-500 hover:border-sky-300"}>{member.name}</button>)}<button type="button" aria-pressed={value === "JOINT"} onClick={() => onChange("JOINT")} className={value === "JOINT" ? "rounded-xl border-2 border-sky-500 bg-sky-50 px-2 py-2.5 text-sm font-black text-sky-700" : "rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-sm font-bold text-slate-500 hover:border-sky-300"}>Birlikte</button></div>;
}
