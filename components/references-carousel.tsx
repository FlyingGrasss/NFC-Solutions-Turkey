"use client";

import Image from "next/image";

type Reference = {
  name: string;
  href: string;
  image: string;
  imageClassName?: string;
};

const circularReferenceImages = new Set([
  "/references/sukriye-atici.jpg",
  "/references/garage-alsancak.jpg",
  "/references/maydonoz-doner.png",
  "/references/salon-kess.jpg",
  "/references/petstylistt.jpg",
  "/references/kayhan-kaya.jpg",
  "/references/mehmet-aktas.jpg",
  "/references/bursa-bey-tursulari.jpg",
  "/references/hursit-kuafor.jpg",
  "/references/rezan-pekdogan.jpg",
  "/references/onail-bodrum.jpg",
  "/references/merve-beauty.png",
]);

const references: Reference[] = [
  { name: "Ayça Jewellery", href: "https://aycajewelry.com.tr/", image: "/references/ayca-jewellery.jpg" },
  { name: "Şükriye Atıcı Güzellik Salonu", href: "https://www.instagram.com/sukriyeaticiguzellikmerkezi/", image: "/references/sukriye-atici.jpg" },
  { name: "Garage Alsancak", href: "https://www.instagram.com/garageizmiralsancak/", image: "/references/garage-alsancak.jpg" },
  { name: "Hangay Saat", href: "https://hangaysaat.com/", image: "/references/hangay-saat.jpg", imageClassName: "max-h-14" },
  { name: "Shine by Pin", href: "https://www.shinebypin.com/", image: "/references/shine-by-pin.svg", imageClassName: "max-h-16" },
  { name: "Maydonoz Döner", href: "https://maydonozdoner.com/", image: "/references/maydonoz-doner.png", imageClassName: "max-h-20" },
  { name: "Multi Event", href: "https://multievent.org/", image: "/references/multi-event.jpg" },
  { name: "Salon Kess", href: "https://www.instagram.com/salonkes/", image: "/references/salon-kess.jpg" },
  { name: "Petstylistt", href: "https://www.instagram.com/petstylistt.izmir/", image: "/references/petstylistt.jpg" },
  { name: "Laden Kahvaltı & Et Restoran", href: "https://www.instagram.com/ladenrestaurant/", image: "/references/laden-restaurant.jpg" },
  { name: "Kordon Otel", href: "https://www.kordonotel.com.tr/tr/", image: "/references/kordon-otel.png", imageClassName: "max-h-14" },
  { name: "Kayhan Kaya Saç Tasarım", href: "https://www.instagram.com/kayhankayasactasarim/", image: "/references/kayhan-kaya.jpg" },
  { name: "Mehmet Aktaş Bayan Kuaförü", href: "https://www.instagram.com/mehmetaktas35/", image: "/references/mehmet-aktas.jpg" },
  { name: "YU Bodrum", href: "https://www.yubodrum.com/", image: "/references/yu-bodrum.png", imageClassName: "max-h-20" },
  { name: "YU Bake House", href: "https://www.instagram.com/yubakehouse/", image: "/references/yu-bake-house.jpg" },
  { name: "Derin Restorant Beach & Bar", href: "https://www.derinrestorant.com.tr/", image: "/references/derin-restorant.png", imageClassName: "max-h-16" },
  { name: "Berk Balık Bodrum", href: "https://www.instagram.com/berkbalikbodrum/", image: "/references/berk-balik.jpg" },
  { name: "Artemis Restaurant Bodrum", href: "https://www.artemisyemek.com/", image: "/references/artemis-restaurant.png", imageClassName: "max-h-20 rounded-xl bg-white p-2" },
  { name: "Nokta Sebzeli Döner Bodrum", href: "https://www.instagram.com/noktasebzelibodrumdoneri/", image: "/references/nokta-sebzeli-doner.jpg" },
  { name: "Bursa Bey Turşuları", href: "https://www.instagram.com/bursabeytursulari/", image: "/references/bursa-bey-tursulari.jpg" },
  { name: "Hurşit Kuaför", href: "https://www.instagram.com/hursit.kuafor/", image: "/references/hursit-kuafor.jpg" },
  { name: "Rezan Pekdoğan Art & Beauty", href: "https://www.instagram.com/rezanpekdoganartandbeauty/", image: "/references/rezan-pekdogan.jpg" },
    { name: "Uzm. Fzt. Bedriye Dağ", href: "https://www.bedriyedag.com/", image: "/references/bedriye-dag.svg", imageClassName: "max-h-16" },
  { name: "İkon Restaurant Yalıkavak", href: "https://www.happygroup.com.tr/subelerimiz/ikon/ikon-yalikavak-marina", image: "/references/happy-group.webp", imageClassName: "max-h-20 rounded-xl" },
  { name: "Raha Bodrum", href: "https://www.instagram.com/rahayalikavak/", image: "/references/raha-bodrum.jpg", imageClassName: "max-h-20 rounded-xl" },
  { name: "Hair Barber Adnan", href: "https://www.google.com/maps/search/?api=1&query=Hair+Barber+Adnan+Yal%C4%B1kavak", image: "/references/hair-barber-adnan.jpg", imageClassName: "max-h-16 rounded-xl" },
  { name: "Sofi's Marina Brasserie", href: "https://sofismarinabrasserie.com/", image: "/references/sofis-marina.png", imageClassName: "max-h-16" },
  { name: "O'Nail Tırnak & Estetik Center", href: "https://www.instagram.com/onailbodrum/", image: "/references/onail-bodrum.jpg", imageClassName: "max-h-16" },
  { name: "Linam Restaurant", href: "https://linamrestaurant.com/", image: "/references/linam-restaurant.png", imageClassName: "max-h-16" },
  { name: "Mösyö Bodrum", href: "https://www.instagram.com/mosyobodrum/", image: "/references/mosyo-bodrum.jpg", imageClassName: "max-h-20 rounded-xl" },
  { name: "Industry Burger", href: "https://industryburger.com.tr/menu", image: "/references/industry-burger.png", imageClassName: "max-h-16 rounded-xl bg-slate-950 p-2" },
  { name: "Kuaför Murat Ekinlioğlu", href: "https://www.instagram.com/murathairsalon/", image: "/references/murat-ekinlioglu.jpg", imageClassName: "max-h-16" },
  { name: "Merve Özkan Beauty Studio", href: "https://www.instagram.com/merveozkanbeautystudio/", image: "/references/merve-beauty.jpg", imageClassName: "max-h-16" },
  { name: "Yalı Çapkını", href: "https://www.instagram.com/yalicapkini_bodrum/", image: "/references/yali-capkini-instagram.jpg", imageClassName: "max-h-20 rounded-xl" },
  { name: "The Garden Restaurant Bar", href: "https://www.instagram.com/thegardenbodrum/", image: "/references/the-garden-bodrum-instagram.jpg", imageClassName: "max-h-20 rounded-xl" },
  { name: "Jay Jay Center", href: "https://www.instagram.com/jay_jay_center/", image: "/references/jay-jay-center.jpg", imageClassName: "max-h-16" },
];

function ReferenceItem({ reference }: { reference: Reference }) {
  return (
    <a
      href={reference.href}
      target="_blank"
      rel="noreferrer"
      className="group flex w-[9.5rem] shrink-0 self-start snap-start flex-col items-center px-2 py-3 text-center max-[420px]:w-[8.5rem] sm:w-[12rem] sm:py-4"
    >
      <span className="flex h-24 w-full items-center justify-center">
        <Image
          src={reference.image}
          alt={`${reference.name} logosu`}
          width={160}
          height={80}
          unoptimized
          className={`max-h-20 w-auto max-w-full object-contain transition duration-500 ease-out group-hover:scale-[1.18] ${circularReferenceImages.has(reference.image) ? "rounded-full" : ""} ${reference.imageClassName ?? ""}`}
        />
      </span>
      <span className="mt-4 text-sm font-bold leading-5 text-[#effff1]/80 transition-colors duration-300 group-hover:text-[#a5efbd]">
        {reference.name}
      </span>
    </a>
  );
}

function ReferenceMarquee({ rowCount }: { rowCount: 2 | 3 }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rowCount }, (_, rowIndex) => {
        const rowReferences = references.filter((_, index) => index % rowCount === rowIndex);
        const movesRight = rowIndex % 2 === 1;

        return (
          <div key={rowIndex} className="overflow-hidden">
            <div className={`references-marquee-track flex w-max focus-within:[animation-play-state:paused] hover:[animation-play-state:paused] ${movesRight ? "references-marquee-track-reverse" : ""}`}>
              {[0, 1].map((groupIndex) => (
                <div key={groupIndex} className="flex shrink-0 gap-3 pr-3" aria-hidden={groupIndex === 1}>
                  {rowReferences.map((reference, index) => (
                    <ReferenceItem key={`${rowIndex}-${groupIndex}-${reference.name}-${index}`} reference={reference} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ReferencesCarousel() {
  return (
    <section id="referanslar" className="scroll-mt-8 border-y border-[#d6f6e2]/10 bg-[#0a2019]/60 py-24">
      <div className="mx-auto w-[min(100%-3rem,75rem)]">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2.5 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#80d89e]"><span className="block h-px w-7 bg-[#75d49a]" /> Referanslarımız</p>
          <h2 className="mt-5 text-4xl font-extrabold leading-[1.04] tracking-[0.005em] text-[#f5faf4] sm:text-6xl">Markalarına<br /><em className="font-light tracking-[0.01em] text-[#8ce0ac]">dokunduk.</em></h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#d5efd9]/55">Farklı sektörlerden işletmeler için NFC kartları ve tek dokunuşluk dijital deneyimler tasarladık.</p>
        </div>

        <div className="mt-12 hidden overflow-hidden py-8 sm:block" aria-label="Referanslarımız">
          <ReferenceMarquee rowCount={2} />
        </div>
        <div className="mt-12 overflow-hidden py-8 sm:hidden" aria-label="Referanslarımız">
          <ReferenceMarquee rowCount={3} />
        </div>
      </div>
    </section>
  );
}
