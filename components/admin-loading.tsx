import { AdminNav } from "@/components/admin-nav";
import { AdminHeader } from "@/components/admin-header";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { fieldInputClass, fieldLabelClass } from "@/lib/ui";

const panelClass = "rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_38px_rgb(25_55_36_/_0.05)] sm:p-6";
const shimmerClass = "animate-pulse bg-slate-200/80";

function DataPlaceholder({ className = "h-4 w-24" }: { className?: string }) {
  return <span aria-hidden="true" className={`inline-block rounded-lg ${shimmerClass} ${className}`} />;
}

function StaticField({ label, placeholder, tall = false }: { label: string; placeholder?: string; tall?: boolean }) {
  return (
    <div>
      <p className={fieldLabelClass}>{label}</p>
      {tall ? <textarea disabled rows={4} placeholder={placeholder} className={`${fieldInputClass} h-auto py-3`} /> : <input disabled placeholder={placeholder} className={fieldInputClass} />}
    </div>
  );
}

function StaticButton({ children, muted = false, variant }: { children: React.ReactNode; muted?: boolean; variant?: "large" | "cardPrimary" | "cardOutline" | "compact" | "plain" }) {
  const className = variant === "plain"
    ? "rounded-xl px-3 py-3 text-sm font-bold text-rose-500 transition hover:bg-rose-50"
    : variant === "compact"
      ? "rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
      : variant === "cardPrimary"
        ? "rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
        : variant === "cardOutline" || muted
          ? "rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        : "rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700";

  return (
    <div className={`${className} text-center`}>
      {children}
    </div>
  );
}

function StaticCheck({ children }: { children: React.ReactNode }) {
  return <label className="flex items-center gap-2 text-xs font-semibold text-slate-500"><input type="checkbox" defaultChecked className="h-4 w-4 accent-emerald-600" />{children}</label>;
}

function StaticSettingInput({ placeholder, className = "" }: { placeholder?: string; className?: string }) {
  return <input disabled placeholder={placeholder} className={`${fieldInputClass} ${className}`} />;
}

function StaticProfileSetting({ label, placeholder, checks = true }: { label: string; placeholder?: string; checks?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-black text-slate-800">{label}</p>
        {checks ? <div className="flex flex-wrap gap-4"><StaticCheck>Göster</StaticCheck><StaticCheck>Tam genişlik</StaticCheck></div> : null}
      </div>
      {placeholder ? <StaticSettingInput placeholder={placeholder} className="mt-3" /> : null}
    </div>
  );
}

function AdminShell({ children, maxWidth = "max-w-6xl" }: { children: React.ReactNode; maxWidth?: string }) {
  return (
    <main className="min-h-screen bg-[#f4f7f5] px-4 py-5 sm:px-6 sm:py-8" aria-busy="true">
      <div className={`mx-auto ${maxWidth}`}>
        {children}
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title, description, right }: { eyebrow: string; title: string; description?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-emerald-600">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {right}
    </div>
  );
}

function TransactionFormLoading() {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 block text-xs font-extrabold text-slate-600">Tür</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-slate-300 bg-slate-100 px-4 py-3 text-center text-sm font-black text-slate-600"><span className="mb-1 block text-lg">↑</span>Gelir</div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-bold text-slate-400"><span className="mb-1 block text-lg">↓</span>Gider</div>
        </div>
      </div>
      <StaticField label="Gideri kim ödedi?" placeholder="Bölüşüldü" />
      <StaticField label="Tutar" placeholder="0,00" />
      <StaticField label="Açıklama" placeholder="Örn. market alışverişi" />
      <StaticField label="Tarih" />
      <div className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-center text-sm font-bold text-white">Kaydı ekle</div>
    </div>
  );
}

function LeadFormLoading() {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 block text-xs font-extrabold text-slate-600">Tür</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {['Mesaj', 'Arama', 'Mail', 'Sipariş'].map((label, index) => <div key={label} className={index === 0 ? "rounded-xl border-2 border-slate-300 bg-slate-100 px-3 py-2.5 text-center text-sm font-black text-slate-700" : "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-sm font-bold text-slate-400"}>{label}</div>)}
        </div>
      </div>
      <StaticField label="Kişi" placeholder="Ahmet H. Yazıcı" />
      <StaticField label="İletişim bilgisi" placeholder="Telefon, e-posta veya başka bir bilgi" />
      <StaticField label="Takip / teslim tarihi" />
      <StaticField label="Detaylar" placeholder="Notlar, istekler, teslim detayları..." tall />
      <div className="flex gap-3"><div className="flex-1 rounded-2xl bg-slate-900 px-5 py-3.5 text-center text-sm font-bold text-white">Takip ekle</div></div>
    </div>
  );
}

function StockCreationLoading() {
  return (
    <div className="space-y-4">
      <StaticField label="Ürün adı" placeholder="NFC Google Card" />
      <StaticField label="Başlangıç miktarı" placeholder="100" />
      <StaticField label="İşlem başlığı" placeholder="Örn. İlk stok girişi" />
      <div className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-center text-sm font-bold text-white">Stok ürünü ekle</div>
    </div>
  );
}

function StockAdjustmentLoading() {
  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <StaticField label="Miktar (boşsa 1)" placeholder="1" />
        <StaticField label="İşlem başlığı" placeholder="Örn. Yeni kart siparişi" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-700">+ Stok ekle</div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-black text-rose-700">− Stok çıkar</div>
      </div>
    </div>
  );
}

function GoogleReviewAdminLoading() {
  return (
    <section className={`${panelClass} mt-6`}>
      <div className="mb-5">
        <div>
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-emerald-600">Google yorumları</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Yorum bağlantısı oluştur</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Google Maps işletme bağlantısını yapıştırın; yorum bağlantısını oluşturup kopyalayın.</p>
        </div>
      </div>
      <div>
        <p className={fieldLabelClass}>Google Maps bağlantısı</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <StaticSettingInput placeholder="https://maps.app.goo.gl/..." />
          <div className="shrink-0 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white">Bağlantı oluştur</div>
        </div>
      </div>
      <div className="mt-4">
        <p className={fieldLabelClass}>Oluşturulan yorum bağlantısı</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <StaticSettingInput placeholder="Bağlantı burada görünür" />
          <div className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-700">Kopyala</div>
        </div>
      </div>
    </section>
  );
}

export function AdminLoading() {
  return (
    <AdminShell>
      <AdminHeader eyebrow="Yönetim" title="Gelir Gider" description="Gelir, gider ve takiplerini tek yerde yönet.">
        <div className="order-1 sm:order-2"><AdminLogoutButton /></div>
        <p className="order-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:order-1"><DataPlaceholder className="h-3 w-5 align-middle" /> kayıt</p>
      </AdminHeader>
      <AdminNav active="overview" />
      <section className="hidden">
        <div>
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-emerald-600">Genel bakış</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Merhaba, <DataPlaceholder className="h-9 w-36 align-middle" /></h1>
          <p className="mt-2 text-sm text-slate-500">Gelir, gider ve takiplerini tek yerde yönet.</p>
        </div>
        <p className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm"><DataPlaceholder className="h-3 w-5 align-middle" /> kayıt</p>
      </section>

      <GoogleReviewAdminLoading />

      <section className="mb-8 mt-6 grid gap-4 sm:grid-cols-3">
        <div className="min-h-42 rounded-3xl border border-slate-900 bg-slate-900 p-5 text-white shadow-[0_12px_38px_rgb(25_55_36_/_0.08)]"><p className="text-xs font-extrabold uppercase tracking-wide text-white/60">Bakiye</p><p className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-black"><DataPlaceholder className="h-8 w-32 bg-white/20" /></p><p className="mt-4 text-xs text-white/60">Gelirlerden giderler çıkarıldı</p></div>
        <div className="min-h-42 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_38px_rgb(25_55_36_/_0.05)]"><p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Toplam gelir</p><p className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-black text-emerald-700"><DataPlaceholder className="h-8 w-32" /></p><p className="mt-4 text-xs text-slate-400"><DataPlaceholder className="h-3 w-5 align-middle" /> gelir kaydı</p></div>
        <div className="min-h-42 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_38px_rgb(25_55_36_/_0.05)]"><p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Toplam gider</p><p className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-black text-rose-600"><DataPlaceholder className="h-8 w-32" /></p><p className="mt-4 text-xs text-slate-400"><DataPlaceholder className="h-3 w-5 align-middle" /> gider kaydı</p></div>
      </section>

      <section className={`${panelClass} mt-6`}>
        <SectionHeading eyebrow="Karşılaştırma" title="Kim ne kadar aldı, kim ne kadar harcadı?" description="“Bölüşüldü” kayıtları üyeler arasında eşit paylaştırılır. Eşitlik hesabı, alınan para eksi harcanan para üzerinden yapılır." />
        <div className="grid gap-3 md:grid-cols-2">{[0, 1].map((index) => <article key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><h3 className="text-base font-black text-slate-900"><DataPlaceholder className="h-5 w-28 align-middle" /></h3><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Harcadı</p><p className="mt-1 text-lg font-black text-rose-600"><DataPlaceholder className="h-6 w-24" /></p></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Aldı</p><p className="mt-1 text-lg font-black text-emerald-700"><DataPlaceholder className="h-6 w-24" /></p></div></div><div className="mt-4 border-t border-slate-200 pt-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Net (aldı − harcadı)</p><p className="mt-1 text-sm font-black text-slate-700"><DataPlaceholder className="h-4 w-24" /></p><p className="mt-2 text-sm font-bold text-slate-500"><DataPlaceholder className="h-4 w-28" /></p></div></article>)}</div>
        <p className="mt-5 text-xs font-semibold text-slate-400">Toplam: <DataPlaceholder className="h-3 w-20 align-middle" /> gelir · <DataPlaceholder className="h-3 w-20 align-middle" /> gider</p>
      </section>

      <section className={`${panelClass} mb-8 mt-6`}>
        <SectionHeading eyebrow="Ana sayfadan gelenler" title="İletişim mesajları" right={<span className="text-xs font-medium text-slate-400">En yeni 100</span>} />
        <div className="grid gap-3">{[0, 1].map((index) => <article key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black text-slate-900"><DataPlaceholder className="h-5 w-32" /></h3><p className="mt-1 text-sm font-semibold text-emerald-700"><DataPlaceholder className="h-4 w-40" /></p></div><DataPlaceholder className="h-3 w-24" /></div><p className="mt-3"><DataPlaceholder className="h-4 w-full" /><DataPlaceholder className="mt-2 h-4 w-4/5" /></p></article>)}</div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
        <section className={`${panelClass} h-fit`}><SectionHeading eyebrow="Yeni kayıt" title="Hareket ekle" /><TransactionFormLoading /></section>
        <section className={panelClass}><SectionHeading eyebrow="Son hareketler" title="Kayıtlar" right={<span className="text-xs font-medium text-slate-400">En yeni 100</span>} />{[0, 1, 2, 3].map((index) => <div key={index} className="border-b border-slate-100 py-4 last:border-0"><DataPlaceholder className="h-4 w-3/5" /><div className="mt-2"><DataPlaceholder className="h-3 w-4/5" /></div></div>)}</section>
      </section>
    </AdminShell>
  );
}

export function LeadsLoading() {
  return (
    <AdminShell>
      <AdminHeader eyebrow="Takip listesi" title="Takipler" description="Mesaj, arama, mail ve siparişleri tek yerde takip et.">
        <div className="order-1 sm:order-2"><AdminLogoutButton /></div>
      </AdminHeader>
      <AdminNav active="leads" />
      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]"><section className={`${panelClass} h-fit`}><SectionHeading eyebrow="Takip listesi" title="Yeni takip" description="Bir kişiyi, iletişim bilgisini, takip tarihini ve notlarını kaydet." /><LeadFormLoading /></section><section className={panelClass}><SectionHeading eyebrow="Takip listesi" title="Kayıtlı takipler" right={<span className="text-xs font-medium text-slate-400">En yeni 100</span>} />{[0, 1, 2, 3].map((index) => <div key={index} className="border-b border-slate-100 py-4 last:border-0"><DataPlaceholder className="h-4 w-2/5" /><div className="mt-3"><DataPlaceholder className="h-3 w-4/5" /></div><div className="mt-3"><DataPlaceholder className="h-3 w-1/2" /></div></div>)}</section></section>
    </AdminShell>
  );
}

export function ProfilesLoading() {
  return (
    <AdminShell>
      <AdminHeader eyebrow="Yönetim" title="Profil kartları" description="Kişisel link kartlarını buradan oluştur ve yönet.">
        <div className="order-1 sm:order-2"><AdminLogoutButton /></div>
        <div className="order-2 sm:order-1"><StaticButton>+ Yeni profil</StaticButton></div>
      </AdminHeader>
      <AdminNav active="profiles" />
      <section className="mt-6 grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((index) => <article key={index} className={panelClass}><div className="flex items-start justify-between gap-4"><div><p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-emerald-600">/<DataPlaceholder className="h-3 w-20 align-middle" /></p><h2 className="mt-1 text-xl font-black text-slate-950"><DataPlaceholder className="h-6 w-36" /></h2><p className="mt-1 text-sm text-slate-500"><DataPlaceholder className="h-4 w-28" /></p><p className="mt-3 text-xs text-slate-400"><DataPlaceholder className="h-3 w-5 align-middle" /> bağlantı</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Aktif</span></div><div className="mt-6 flex flex-wrap gap-3"><StaticButton variant="cardPrimary">Düzenle</StaticButton><StaticButton variant="cardOutline">Herkese açık sayfa ↗</StaticButton><StaticButton variant="cardOutline">Profil yönetimi ↗</StaticButton></div></article>)}</section>
    </AdminShell>
  );
}

export function StockLoading() {
  return (
    <AdminShell>
      <AdminHeader eyebrow="Yönetim" title="Stok takibi" description="Kart stoklarını, giriş-çıkışları ve işlemi yapan kişiyi tek yerde takip et.">
        <div className="order-1 sm:order-2"><AdminLogoutButton /></div>
        <div className="order-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:order-1"><DataPlaceholder className="h-3 w-5 align-middle" /> ürün · <DataPlaceholder className="h-3 w-8 align-middle" /> adet</div>
      </AdminHeader>
      <AdminNav active="stock" />
      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]"><section className={`${panelClass} h-fit`}><SectionHeading eyebrow="Yeni ürün" title="Stok ürünü ekle" description="Örneğin NFC Google Card ve mevcut adetini ekleyerek başlayabilirsin." /><StockCreationLoading /></section><section className={panelClass}><SectionHeading eyebrow="Ürünler" title="Mevcut stok" right={<span className="text-xs font-medium text-slate-400">+ / − ile güncelle</span>} /><div className="grid gap-4 xl:grid-cols-2">{[0, 1, 2, 3].map((index) => <article key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-start gap-2"><h3 className="min-w-0 flex-1 break-words text-base font-black text-slate-900"><DataPlaceholder className="h-5 w-36" /></h3><div className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-500">Düzenle</div></div><p className="mt-1 text-xs text-slate-400">Son güncelleme: <DataPlaceholder className="h-3 w-24 align-middle" /></p></div><p className="shrink-0 text-3xl font-black tracking-tight text-emerald-700"><DataPlaceholder className="h-9 w-14" /></p></div><p className="mt-1 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-400">adet</p><StockAdjustmentLoading /></article>)}</div></section></section>
      <section className={`${panelClass} mt-6`}><SectionHeading eyebrow="Denetim kaydı" title="Stok hareketleri" right={<span className="text-xs font-medium text-slate-400">En yeni 100</span>} /><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-100 text-xs font-extrabold uppercase tracking-wide text-slate-400"><tr><th className="pb-3 pr-4">Ürün</th><th className="pb-3 pr-4">Değişim</th><th className="pb-3 pr-4">Başlık</th><th className="pb-3 pr-4">İşlemi yapan</th><th className="pb-3">Tarih</th></tr></thead><tbody>{[0, 1, 2, 3, 4].map((index) => <tr key={index} className="border-b border-slate-100"><td className="py-4 pr-4"><DataPlaceholder className="h-4 w-32" /></td><td className="py-4 pr-4"><DataPlaceholder className="h-4 w-10" /></td><td className="py-4 pr-4"><DataPlaceholder className="h-4 w-40" /></td><td className="py-4 pr-4"><DataPlaceholder className="h-4 w-24" /></td><td className="py-4"><DataPlaceholder className="h-3 w-24" /></td></tr>)}</tbody></table></div></section>
    </AdminShell>
  );
}

export function ProfileEditorLoading({ mode = "edit" }: { mode?: "create" | "edit" }) {
  return (
    <AdminShell maxWidth="max-w-4xl">
      <AdminNav active="profiles" />
      <header className="my-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-emerald-600">Profil kartları</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{mode === "create" ? "Yeni profil oluştur" : <><DataPlaceholder className="h-9 w-48 align-middle" /> düzenle</>}</h1>{mode === "create" ? <p className="mt-2 text-sm leading-6 text-slate-500">Profil sahibi daha sonra /slug/admin adresinden bu bilgileri düzenleyebilir.</p> : null}</div>{mode === "edit" ? <StaticButton variant="cardOutline">Herkese açık sayfa ↗</StaticButton> : null}</header>
      <section className={panelClass}>
        <div className="space-y-7">
          <section className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0"><SectionHeading eyebrow="Temel bilgiler" title="Profil kartı" /><div className="grid gap-4 sm:grid-cols-2"><StaticField label="Kısa adres" />{mode === "create" ? <StaticField label="Profil şifresi" /> : null}<StaticField label="İsim" /><StaticField label="Başlık (opsiyonel)" /><div className="sm:col-span-2"><StaticField label="İkinci başlık (opsiyonel)" /></div><div className="sm:col-span-2"><StaticField label="Görsel bağlantısı (opsiyonel)" /></div></div></section>
          <section className="border-t border-slate-100 pt-6"><SectionHeading eyebrow="Görünüm" title="Renk teması" description="Profil sayfası için hazır temalardan birini seç." /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[
            { label: "Orman", description: "Yeşil ve doğal", background: "linear-gradient(135deg,#071512,#2c7950)" },
            { label: "Gece", description: "Lacivert ve sakin", background: "linear-gradient(135deg,#071321,#3c6eaa)" },
            { label: "Okyanus", description: "Mavi ve ferah", background: "linear-gradient(135deg,#06161b,#1d9bb2)" },
            { label: "Kum", description: "Sıcak ve yumuşak", background: "linear-gradient(135deg,#20170e,#bf8246)" },
            { label: "Erik", description: "Mor ve karakterli", background: "linear-gradient(135deg,#1b0c1c,#a65db2)" },
          ].map((scheme) => <label key={scheme.label} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition"><input type="radio" name="loading-color-scheme" defaultChecked={scheme.label === "Orman"} /><span className="h-10 w-10 shrink-0 rounded-xl" style={{ background: scheme.background }} /><span className="min-w-0"><strong className="block text-sm font-extrabold text-slate-800">{scheme.label}</strong><small className="mt-0.5 block text-xs text-slate-400">{scheme.description}</small></span></label>)}</div></section>
          <section className="border-t border-slate-100 pt-6"><SectionHeading eyebrow="İletişim kartları" title="Butonlar" description="Göster seçimi butonu açar; tam genişlik seçimi mobilde butonu tek satıra taşır." /><div className="grid gap-3"><StaticProfileSetting label="Ara" placeholder="+90 5xx xxx xx xx" /><StaticProfileSetting label="WhatsApp" placeholder="905xx xxx xx xx" /><StaticProfileSetting label="Mail" placeholder="isim@firma.com" /><StaticProfileSetting label="LinkedIn" placeholder="https://linkedin.com/in/..." /><StaticProfileSetting label="Instagram" placeholder="https://instagram.com/..." /><StaticProfileSetting label="Konum" placeholder="https://maps.google.com/..." /><StaticProfileSetting label="Kişilere Ekle" checks /><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-black text-slate-800">IBAN</p><StaticCheck>Göster</StaticCheck></div><StaticSettingInput placeholder="TR00 0000 0000 0000 0000 0000 00" className="mt-3 uppercase" /><p className="mt-2 text-xs leading-5 text-slate-400">Profilde mobil uyumlu bir kopyalama kartı olarak gösterilir.</p></div></div></section>
          <section className="border-t border-slate-100 pt-6"><SectionHeading eyebrow="Alt bölüm" title="Bağlantılar" right={<StaticButton variant="compact">+ Bağlantı ekle</StaticButton>} /><StaticField label="Bağlantılar bölüm başlığı" placeholder="Bağlantılar" /><div className="mt-4 space-y-3"><div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_1.3fr_auto] sm:items-end"><StaticField label="Bağlantı adı" placeholder="İsim" /><StaticField label="Bağlantı" placeholder="https://..." /><StaticButton variant="plain">Kaldır</StaticButton></div></div></section>
          <div className="h-14 rounded-2xl bg-slate-300/80 text-center text-sm font-bold leading-[3.5rem] text-slate-500">{mode === "create" ? "Profili oluştur" : "Değişiklikleri kaydet"}</div>
        </div>
      </section>
    </AdminShell>
  );
}
