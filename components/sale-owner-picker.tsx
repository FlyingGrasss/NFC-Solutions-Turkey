"use client";

export type SaleOwnerOption = {
  id: string;
  name: string;
};

export type SaleModeValue = "UNASSIGNED" | "SOLO" | "JOINT";

export function SaleOwnerPicker({
  members,
  mode,
  soldByMemberId,
  onModeChange,
  onSoldByChange,
}: {
  members: SaleOwnerOption[];
  mode: SaleModeValue;
  soldByMemberId: string | null;
  onModeChange: (value: SaleModeValue) => void;
  onSoldByChange: (value: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {members.slice(0, 2).map((member) => {
        const active = mode === "SOLO" && soldByMemberId === member.id;
        return (
          <button
            key={member.id}
            type="button"
            aria-pressed={active}
            onClick={() => {
              onModeChange("SOLO");
              onSoldByChange(member.id);
            }}
            className={active
              ? "rounded-xl border-2 border-emerald-500 bg-emerald-50 px-2 py-2.5 text-sm font-black text-emerald-700"
              : "rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-sm font-bold text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700"}
          >
            {member.name}
          </button>
        );
      })}
      <button
        type="button"
        aria-pressed={mode === "JOINT"}
        onClick={() => {
          onModeChange("JOINT");
          onSoldByChange(null);
        }}
        className={mode === "JOINT"
          ? "rounded-xl border-2 border-emerald-500 bg-emerald-50 px-2 py-2.5 text-sm font-black text-emerald-700"
          : "rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-sm font-bold text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700"}
      >
        Birlikte
      </button>
    </div>
  );
}
