"use client";

import type { MemberOption } from "@/components/payer-picker";
import { fieldInputClass } from "@/lib/ui";

export function SellerCreditPicker({ members, primaryId, secondaryId, onPrimaryChange, onSecondaryChange }: { members: MemberOption[]; primaryId: string; secondaryId: string; onPrimaryChange: (id: string) => void; onSecondaryChange: (id: string) => void }) {
  return <div className="grid gap-2 sm:grid-cols-2">
    <select required aria-label="Birincil satıcı" value={primaryId} onChange={(event) => { onPrimaryChange(event.target.value); if (event.target.value === secondaryId) onSecondaryChange(""); }} className={fieldInputClass}><option value="">Birincil satıcı seç</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>
    <select aria-label="İkinci satıcı" value={secondaryId} onChange={(event) => onSecondaryChange(event.target.value)} className={fieldInputClass}><option value="">İkinci satıcı yok</option>{members.filter((member) => member.id !== primaryId).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>
  </div>;
}
