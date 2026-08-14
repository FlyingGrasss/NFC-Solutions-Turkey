import type { ReactNode } from "react";
import { eyebrowClass } from "@/lib/ui";

export function AdminHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <header className="mb-8 grid min-h-[152px] grid-cols-1 content-between gap-4 sm:min-h-[88px] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div className="min-w-0">
        <p className={eyebrowClass}>{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 min-h-5 truncate text-sm text-slate-500" title={description}>{description}</p>
      </div>
      <div className="flex h-12 flex-nowrap items-end justify-start gap-2 sm:justify-end">{children}</div>
    </header>
  );
}
