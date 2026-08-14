import type { Metadata } from "next";
import { AdminNav } from "@/components/admin-nav";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { NewStockItemForm, StockAdjustmentForm, StockNameEditor } from "@/components/stock-item-form";
import { createStockItemAction } from "@/app/stock-actions";
import { requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { emptyStateClass, eyebrowClass, panelClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Stok | Yönetim",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

export default async function StockPage() {
  const session = await requireSession();
  const [items, changes] = await Promise.all([
    prisma.stockItem.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
    prisma.stockChange.findMany({
      where: { userId: session.user.id },
      include: { stockItem: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={eyebrowClass}>Yönetim</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Stok takibi</h1>
            <p className="mt-2 text-sm text-slate-500">Kart stoklarını, giriş-çıkışları ve işlemi yapan kişiyi tek yerde takip et.</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <AdminLogoutButton />
            <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm">
              {items.length} ürün · {totalQuantity} adet
            </div>
          </div>
        </header>

        <AdminNav active="stock" />

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
          <section className={`${panelClass} h-fit`}>
            <div className="mb-6">
              <p className={eyebrowClass}>Yeni ürün</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Stok ürünü ekle</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Örneğin NFC Google Card ve mevcut adetini ekleyerek başlayabilirsin.</p>
            </div>
            <NewStockItemForm action={createStockItemAction} />
          </section>

          <section className={panelClass}>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className={eyebrowClass}>Ürünler</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Mevcut stok</h2>
              </div>
              <span className="text-xs font-medium text-slate-400">+ / − ile güncelle</span>
            </div>
            {items.length === 0 ? (
              <div className={emptyStateClass}>
                <p className="font-bold text-slate-700">Henüz stok ürünü yok</p>
                <p className="mt-1 text-sm text-slate-400">Soldaki formdan ilk ürününü ekleyebilirsin.</p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {items.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <StockNameEditor itemId={item.id} initialName={item.name} />
                        <p className="mt-1 text-xs text-slate-400">Son güncelleme: {dateFormatter.format(item.updatedAt)}</p>
                      </div>
                      <p className="shrink-0 text-3xl font-black tracking-tight text-emerald-700">{item.quantity}</p>
                    </div>
                    <p className="mt-1 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-400">adet</p>
                    <StockAdjustmentForm itemId={item.id} itemName={item.name} />
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        <section className={`${panelClass} mt-6`}>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className={eyebrowClass}>Denetim kaydı</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Stok hareketleri</h2>
            </div>
            <span className="text-xs font-medium text-slate-400">En yeni 100</span>
          </div>
          {changes.length === 0 ? (
            <div className={emptyStateClass}>
              <p className="font-bold text-slate-700">Henüz stok hareketi yok</p>
              <p className="mt-1 text-sm text-slate-400">İlk giriş veya çıkış burada görünecek.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-slate-100 text-xs font-extrabold uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="pb-3 pr-4">Ürün</th>
                    <th className="pb-3 pr-4">Değişim</th>
                    <th className="pb-3 pr-4">Başlık</th>
                    <th className="pb-3 pr-4">İşlemi yapan</th>
                    <th className="pb-3">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {changes.map((change) => (
                    <tr key={change.id}>
                      <td className="py-4 pr-4 font-bold text-slate-800">{change.stockItem.name}</td>
                      <td className={`py-4 pr-4 font-black ${change.amount > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                        {change.amount > 0 ? "+" : "−"}{Math.abs(change.amount)}
                      </td>
                      <td className="max-w-56 py-4 pr-4 break-words text-slate-600">{change.title}</td>
                      <td className="py-4 pr-4 text-slate-500">{change.createdByName}</td>
                      <td className="whitespace-nowrap py-4 text-xs text-slate-400">{dateFormatter.format(change.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
