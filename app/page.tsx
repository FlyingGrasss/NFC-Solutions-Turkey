import type { Metadata } from "next";
import Link from "next/link";
import {
  FaAddressBook,
  FaArrowRight,
  FaArrowUpRightFromSquare,
  FaChartLine,
  FaCircleCheck,
  FaLink,
  FaMobileScreenButton,
  FaNfcSymbol,
  FaStar,
  FaUtensils,
} from "react-icons/fa6";
import { BrandLogo } from "@/components/brand-logo";
import { ProductFlipCard } from "@/components/product-flip-card";
import { ReferencesCarousel } from "@/components/references-carousel";
import { SiteFooter } from "@/components/site-footer";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "NFC Kartvizit ve Dijital Kartvizit | NFC Solutions Turkey" },
  description: "Türkiye'de NFC kartvizit, dijital kartvizit ve temassız iletişim çözümleri. Özel tasarım, UV baskı ve tek dokunuşla paylaşım.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    title: "NFC Kartvizit ve Dijital Kartvizit | NFC Solutions Turkey",
    description: "Türkiye'de NFC kartvizit, dijital kartvizit ve temassız iletişim çözümleri.",
    url: absoluteUrl("/"),
    type: "website",
    siteName: "NFC Solutions Turkey",
    images: [{ url: absoluteUrl("/icon.png"), width: 512, height: 512, alt: "NFC Solutions Turkey" }],
  },
};

const container = "mx-auto w-[min(100%-3rem,75rem)]";
const kicker = "inline-flex items-center gap-2.5 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#80d89e]";
const sectionHeading = "max-w-2xl";
const sectionTitle = "mt-5 text-4xl font-extrabold leading-[1.04] tracking-[0.005em] text-[#f5faf4] sm:text-6xl";
const accentText = "font-light tracking-[0.01em] text-[#8ce0ac]";
const heroAccentText = "font-light tracking-[-0.015em] text-[#8ce0ac]";
const primaryButton = "inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#a5efbd] px-5 py-3 text-xs font-extrabold text-[#0b2718] shadow-[0_10px_30px_rgb(105_228_146_/_0.14)] transition hover:-translate-y-0.5 hover:bg-[#c2f8d1]";
const arrowLink = "inline-flex items-center gap-2 text-[0.72rem] font-extrabold text-[#9aebb0] transition hover:gap-3 hover:text-[#d0fbd8]";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${absoluteUrl("/")}#organization`,
        name: "NFC Solutions Turkey",
        url: absoluteUrl("/"),
        logo: absoluteUrl("/icon.png"),
        description: "NFC kartvizit, dijital kartvizit ve temassız iletişim çözümleri.",
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}#website`,
        name: "NFC Solutions Turkey",
        url: absoluteUrl("/"),
        inLanguage: "tr-TR",
        publisher: { "@id": `${absoluteUrl("/")}#organization` },
      },
    ],
  };

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-[#071512] text-[#f4f8f2]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-32 -z-10 h-96 w-96 rounded-full bg-[#51d48d]/15 blur-[90px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-48 top-[48rem] -z-10 h-96 w-96 rounded-full bg-[#258e64]/15 blur-[90px]" />

      <nav className={`${container} flex min-h-[5.5rem] items-center justify-between gap-8 border-b border-[#d6f6e2]/10`} aria-label="Ana menü">
        <Link href="/" aria-label="NFC Solutions Turkey ana sayfa" className="shrink-0 transition-opacity hover:opacity-80">
          <BrandLogo className="h-12 max-w-[18rem]" />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#urunler" className="text-xs font-bold text-[#e1f1e4]/65 transition hover:text-[#f4f8f2]">Ürünler</a>
          <a href="#referanslar" className="text-xs font-bold text-[#e1f1e4]/65 transition hover:text-[#f4f8f2]">Referanslar</a>
          <a href="#cozumler" className="text-xs font-bold text-[#e1f1e4]/65 transition hover:text-[#f4f8f2]">Çözümler</a>
          <Link href="/nasil-calisir" className="text-xs font-bold text-[#e1f1e4]/65 transition hover:text-[#f4f8f2]">Nasıl çalışır?</Link>
          <a href="#iletisim" className="inline-flex items-center gap-2 rounded-full border border-[#b4efc6]/20 px-4 py-2.5 text-xs font-bold text-[#c8f5d6] transition hover:border-[#b4efc6]/45 hover:bg-[#92e5ab]/10">
            İletişime geçin <FaArrowRight />
          </a>
        </div>
      </nav>

      <section className={`${container} grid min-h-[43rem] grid-cols-1 items-center gap-12 pb-20 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(25rem,0.88fr)] lg:gap-12 lg:pt-[4.5rem]`}>
        <div className="relative z-10 max-w-xl">
          <p className={kicker}><span className="block h-px w-7 bg-[#75d49a] shadow-[0_0_12px_rgb(117_212_154_/_0.8)]" /> Türkiye için temassız çözümler</p>
          <h1 className="mt-6 max-w-xl text-[clamp(3rem,7vw,6.5rem)] font-extrabold leading-[1.01] tracking-[-0.02em] text-[#f5faf4]">
            Bir dokunuşla <em className={heroAccentText}>daha fazlasını</em> anlatın.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#daeedd]/60">
            Kartvizitinizi, iletişim bilgilerinizi ve markanızın dijital dünyasını tek bir temassız deneyimde birleştirin.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <a href="#cozumler" className={primaryButton}>Çözümleri keşfedin <FaArrowRight /></a>
            <Link href="/nasil-calisir" className="inline-flex min-h-13 items-center justify-center rounded-full border border-[#ceefd7]/16 px-5 py-3 text-xs font-extrabold text-[#e7f6e8]/75 transition hover:-translate-y-0.5 hover:border-[#ceefd7]/35 hover:bg-[#aeebbf]/10">
              Nasıl çalışır?
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-2.5 text-[0.7rem] font-bold text-[#d7eedb]/45">
            <FaCircleCheck className="text-[#80d89e]" />
            <span>Hızlı kurulum · Kolay paylaşım · Her cihazda erişim</span>
          </div>
        </div>

        <div className="relative mx-auto flex min-h-[33rem] w-full max-w-xl items-center justify-center" aria-label="Temassız dijital kart örneği">
          <div aria-hidden="true" className="absolute h-[28rem] w-[28rem] rounded-full border border-[#9aebb0]/10 shadow-[0_0_100px_rgb(64_174_118_/_0.1)]" />
          <div aria-hidden="true" className="absolute h-[21rem] w-[21rem] rounded-full border border-[#9aebb0]/15" />
          <div aria-hidden="true" className="absolute h-72 w-72 rounded-full bg-[#246e48]/15 blur-3xl" />
          <div className="relative z-10 flex aspect-[1.58/1] w-[min(100%,26rem)] -rotate-6 flex-col justify-between rounded-[1.5rem] border border-[#dcffe5]/25 bg-[linear-gradient(135deg,#2c7950_0%,#0b3020_47%,#061810_100%)] p-6 shadow-[0_30px_70px_rgb(0_0_0_/_0.3)] transition hover:rotate-0">
            <div className="flex items-center justify-between text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[#d9fbe1]/75">
              <span className="inline-flex items-center gap-2"><FaNfcSymbol /> NFC</span>
              <span>01 / 01</span>
            </div>
            <div className="grid h-12 w-16 place-items-center rounded-xl border border-white/25 bg-white/10 text-2xl text-[#a5efbd] shadow-inner shadow-white/10"><FaNfcSymbol /></div>
            <div className="space-y-2">
              <span className="block h-px w-10 bg-[#a5efbd]" />
              <strong className="block text-xl tracking-[-0.02em] text-white">Temassız iletişim</strong>
              <span className="block text-xs text-[#e0f5e3]/60">Tek dokunuşla bağlantı</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/15 pt-3 text-[0.65rem] font-bold text-[#e0f5e3]/60">
              <span>Dokun ve keşfet</span><FaArrowUpRightFromSquare />
            </div>
          </div>
          <div className="absolute right-0 top-12 z-20 flex items-center gap-3 rounded-2xl border border-[#d6f6e2]/15 bg-[#0c2b20]/85 px-4 py-3 text-xs shadow-xl backdrop-blur-xl sm:right-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#a5efbd]/15 text-lg text-[#a5efbd]"><FaMobileScreenButton /></span>
            <span><strong className="block text-[#effff1]">Dijital profil</strong><small className="text-[#d5efd9]/55">Her zaman güncel</small></span>
          </div>
          <div className="absolute bottom-12 left-0 z-20 flex items-center gap-3 rounded-2xl border border-[#d6f6e2]/15 bg-[#0c2b20]/85 px-4 py-3 text-xs shadow-xl backdrop-blur-xl sm:left-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#a5efbd]/15 text-lg text-[#a5efbd]"><FaLink /></span>
            <span><strong className="block text-[#effff1]">Tek dokunuş</strong><small className="text-[#d5efd9]/55">Binlerce bağlantı</small></span>
          </div>
        </div>
      </section>

      <ReferencesCarousel />

      <section id="urunler" className={`${container} scroll-mt-8 pb-32 pt-12`}>
        <div className={`${sectionHeading} mb-12`}>
          <p className={kicker}><span className="block h-px w-7 bg-[#75d49a]" /> Öne çıkan ürünler</p>
          <h2 className={sectionTitle}>İyi bir izlenim,<br /><em className={accentText}>tek dokunuşta.</em></h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#d5efd9]/55">Değerlendirmeleri kolaylaştıran, markanızın görünürlüğünü artıran hazır kart çözümleri.</p>
        </div>
        <div id="degerlendirme-kartlari" className="scroll-mt-8 pt-4">
          <h3 className="text-2xl font-bold tracking-[0.005em] text-[#effff1] sm:text-3xl">Değerlendirme kartları</h3>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[#d5efd9]/50">Markanız için doğru platforma tek dokunuşla yönlendiren kartlar.</p>
          <div className="mx-auto mt-7 grid max-w-3xl gap-12 md:grid-cols-2">
            {[
              { frontImage: "/NFC Google Review Card.png", backImage: "/NFC Google Review Card Back.png", badge: "Google", category: "Değerlendirme kartı", title: "Google değerlendirme kartı", description: "Misafirlerinizden hızlı ve zahmetsiz şekilde değerlendirme alın." },
              { frontImage: "/NFC Tripadvisor Review Card.png", backImage: "/NFC Tripadvisor Review Card Back.png", badge: "Tripadvisor", category: "Değerlendirme kartı", title: "Tripadvisor değerlendirme kartı", description: "Konuklarınızın deneyimini görünür kılın ve daha fazla kişiye ulaşın." },
              { frontImage: "/NFC Hotels.com Review Card.png", backImage: "/NFC Hotels.com Review Card Back.png", badge: "Hotels.com", category: "Değerlendirme kartı", title: "Hotels.com değerlendirme kartı", description: "Otel deneyimlerini doğru yerde, doğru anda değerlendirmeye dönüştürün." },
              { frontImage: "/NFC Booking.com Review Card.png", backImage: "/NFC Booking.com Review Card Back.png", badge: "Booking.com", category: "Değerlendirme kartı", title: "Booking.com değerlendirme kartı", description: "Misafirlerinizi doğru değerlendirme noktasına tek dokunuşla yönlendirin." },
              { frontImage: "/NFC DoktorTakvimi Review Card.png", backImage: "/NFC DoktorTakvimi Review Card Back.png", badge: "DoktorTakvimi", category: "Değerlendirme kartı", title: "DoktorTakvimi Değerlendirme Kartı", description: "Hastalarınızın deneyimini kolayca paylaşmasını sağlayın." },
            ].map((product) => (
              <ProductFlipCard key={product.badge} {...product} />
            ))}
          </div>
        </div>
        <div id="iletisim-kartlari" className="mt-24 scroll-mt-8">
          <h3 className="text-2xl font-bold tracking-[0.005em] text-[#effff1] sm:text-3xl">İletişim kartları</h3>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[#d5efd9]/50">Instagram ve WhatsApp bağlantılarınızı tek dokunuşla erişilebilir hale getirin.</p>
          <div className="mx-auto mt-7 grid max-w-3xl gap-12 md:grid-cols-2">
            {[
              { frontImage: "/NFC Instagram Review Card.png", backImage: "/NFC Instagram Review Card Back.png", badge: "Instagram", category: "Sosyal medya kartı", title: "Instagram bağlantı kartı", description: "Profilinizi, içeriklerinizi ve iletişim kanallarınızı tek dokunuşla açın." },
              { frontImage: "/NFC WhatsApp Review Card.png", backImage: "/NFC WhatsApp Review Card Back.png", badge: "WhatsApp", category: "İletişim kartı", title: "WhatsApp bağlantı kartı", description: "Müşterilerinizle hızlıca sohbet başlatın ve iletişimi kolaylaştırın." },
            ].map((product) => (
              <ProductFlipCard key={product.badge} {...product} />
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-4 border-y border-[#d6f6e2]/10 py-5 sm:grid-cols-[0.45fr_1fr]">
          <span className="text-xs font-extrabold text-[#a2ecb6]">İhtiyacınıza göre</span>
          <p className="text-sm leading-7 text-[#d5efd9]/52">İhtiyacınıza göre yeni bağlantılar ve ürünler tasarlıyor, dijital temas noktalarınızı birlikte geliştiriyoruz.</p>
        </div>
        <div id="dijital-kartvizit" className="mt-24 scroll-mt-8 grid overflow-hidden rounded-[1.75rem] border border-[#b1efc3]/15 bg-[linear-gradient(110deg,#123b29,#0c2419_55%,#0a1913)] lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-7 sm:p-10">
            <p className={kicker}><span className="block h-px w-7 bg-[#75d49a]" /> Size özel</p>
            <h3 className="mt-5 text-3xl font-extrabold leading-[1.06] tracking-[0.005em] text-white sm:text-5xl">Dijital Kartvizitiniz<br /><em className={accentText}>markanız kadar özgün.</em></h3>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#d5efd9]/60">Hazır şablonlarla sınırlı kalmayın. Renkleri, bağlantıları ve deneyimi markanıza göre tasarlayalım.</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
              <Link href="/emre-bozkurt" className={arrowLink}>Örnek dijital kartviziti inceleyin <FaArrowRight /></Link>
              <Link href="/dijital-kartvizit" className={arrowLink}>Dijital kartvizit çözümünü inceleyin <FaArrowRight /></Link>
            </div>
          </div>
          <div className="relative grid min-h-80 place-items-center overflow-hidden bg-[#071c12]/40">
            <div className="absolute h-56 w-56 rounded-full bg-[#65d792]/20 blur-3xl" />
            <div className="relative flex h-56 w-40 flex-col rounded-2xl border border-white/20 bg-[linear-gradient(145deg,#2d7950,#0a2d1e)] p-5 shadow-2xl">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-white/10 text-[#a5efbd]"><FaNfcSymbol /></span>
              <span className="mt-6 h-px w-8 bg-[#a5efbd]" />
              <strong className="mt-4 text-lg leading-tight text-white">Dijital<br />Kartvizit</strong>
              <small className="mt-auto text-[0.6rem] text-[#e0f5e3]/55">Size özel tasarım</small>
            </div>
          </div>
        </div>
      </section>

      <section id="cozumler" className={`${container} py-24`}>
        <div className={sectionHeading}>
          <p className={kicker}><span className="block h-px w-7 bg-[#75d49a]" /> Çözümler</p>
          <h2 className={sectionTitle}>İletişimin yeni<br /><em className={accentText}>temassız hali.</em></h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#d5efd9]/55">İnsanların markanızla bağlantı kurmasını kolaylaştıran sade, hızlı ve etkili çözümler.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            { number: "01", icon: <FaNfcSymbol />, title: "NFC kartvizit", description: "Bilgilerinizi basılı bir kartın sınırlarından çıkarın. Dokundurun, paylaşın, akılda kalın.", href: "#dijital-kartvizit", linkLabel: "Dijital kartviziti inceleyin", external: false },
            { number: "02", icon: <FaMobileScreenButton />, title: "Dijital profil", description: "Telefon, WhatsApp, e-posta, sosyal medya ve konum bilgilerinizi tek bir sayfada buluşturun.", href: "/emre-bozkurt", linkLabel: "Örneği inceleyin · emre-bozkurt", external: false },
            { number: "03", icon: <FaChartLine />, title: "İşletme deneyimi", description: "Ekibiniz, şubeleriniz ve ürünleriniz için her temas noktasını ölçülebilir bir bağlantıya dönüştürün.", href: "#iletisim", linkLabel: "Çözümü konuşalım", external: false },
            { number: "04", icon: <FaStar />, title: "Değerlendirme kartları", description: "Google, Tripadvisor, Hotels.com, Booking.com ve DoktorTakvimi için geri bildirim toplamayı kolaylaştırın.", href: "#degerlendirme-kartlari", linkLabel: "Kartları inceleyin", external: false },
            { number: "05", icon: <FaAddressBook />, title: "İletişim kartları", description: "Instagram, WhatsApp ve diğer iletişim bilgilerinizi tek bir dokunuşla erişilebilir hale getirin.", href: "#iletisim-kartlari", linkLabel: "Instagram ve WhatsApp kartlarını inceleyin", external: false },
            { number: "06", icon: <FaUtensils />, title: "Dijital menü", description: "Menünüzü hızlıca güncelleyebileceğiniz, müşterilerinizin tek dokunuşla açabileceği dijital bir deneyime dönüştürün.", href: "#iletisim", linkLabel: "Dijital menüyü konuşalım", external: false },
          ].map((solution, index) => (
            <article key={solution.number} className={`min-h-72 rounded-[1.75rem] border p-8 transition hover:-translate-y-1 ${index === 0 ? "border-[#8ce0ac]/35 bg-[#123b29]/70" : "border-[#d2f4d8]/13 bg-[#0c271a]/55 hover:border-[#a6edb7]/35"}`}>
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#a5efbd]/10 text-lg text-[#9aebb0]">{solution.icon}</span>
                <span className="font-mono text-xs text-[#9aebb0]/45">{solution.number}</span>
              </div>
              <h3 className="mt-8 text-2xl font-bold tracking-[0.005em] text-[#effff1]">{solution.title}</h3>
              <p className="mt-3 min-h-24 max-w-xl text-sm leading-7 text-[#d5efd9]/55">{solution.description}</p>
              <a href={solution.href} target={solution.external ? "_blank" : undefined} rel={solution.external ? "noreferrer" : undefined} className={`${arrowLink} mt-5`}>{solution.linkLabel} <FaArrowRight /></a>
            </article>
          ))}
        </div>
      </section>

      <section id="nasil-calisir" className="border-y border-[#d6f6e2]/10 bg-[#0a2019]/60 py-24">
        <div className={`${container} grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center`}>
          <div className="max-w-lg">
            <p className={kicker}><span className="block h-px w-7 bg-[#75d49a]" /> Nasıl çalışır?</p>
            <h2 className={sectionTitle}>Basit bir dokunuş,<br /><em className={accentText}>güçlü bir iz.</em></h2>
            <p className="mt-5 text-sm leading-7 text-[#d5efd9]/55">Teknik karmaşayı arka planda bırakın. Siz deneyime odaklanın; biz bağlantıyı kolaylaştıralım.</p>
            <a href="#iletisim" className={`${primaryButton} mt-7`}>İletişime geçin <FaArrowRight /></a>
          </div>
          <div className="space-y-3">
            {[
              ["01", "Profilinizi oluşturun", "Bilgilerinizi ve bağlantılarınızı tek bir yerde düzenleyin."],
              ["02", "NFC kartınızı seçin", "NFC kartınızla bağlantınızı ve iletişim bilgilerinizi paylaşın."],
              ["03", "Bağlantınızı paylaşın", "Karşınızdaki kişi dokunduğu anda güncel profiliniz açılır."],
            ].map(([number, title, description]) => (
              <div key={number} className="flex items-start gap-5 border-b border-[#d6f6e2]/10 py-5">
                <span className="font-mono text-sm text-[#9aebb0]">{number}</span>
                <div><h3 className="font-bold text-[#effff1]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#d5efd9]/50">{description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
