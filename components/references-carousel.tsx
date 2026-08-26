"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

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
];

function ReferenceItem({ reference, onHoverStart, onHoverEnd }: { reference: Reference; onHoverStart: () => void; onHoverEnd: () => void }) {
  return (
    <a
      href={reference.href}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
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

export function ReferencesCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const scrollTrack = track;

    let animationFrame = 0;
    let lastTime = performance.now();
    let position = scrollTrack.scrollLeft;

    function animate(currentTime: number) {
      const elapsed = Math.min(currentTime - lastTime, 50);
      lastTime = currentTime;

      if (!pausedRef.current) {
        const firstGroup = scrollTrack.firstElementChild as HTMLElement | null;
        const secondGroup = firstGroup?.nextElementSibling as HTMLElement | null;
        const loopWidth = firstGroup && secondGroup ? secondGroup.offsetLeft - firstGroup.offsetLeft : 0;

        if (loopWidth > 0) {
          position += elapsed * 0.045;
          if (position >= loopWidth) position -= loopWidth;
          scrollTrack.scrollLeft = position;
        }
      } else {
        position = scrollTrack.scrollLeft;
      }

      animationFrame = requestAnimationFrame(animate);
    }

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section id="referanslar" className="scroll-mt-8 border-y border-[#d6f6e2]/10 bg-[#0a2019]/60 py-24">
      <div className="mx-auto w-[min(100%-3rem,75rem)]">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2.5 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[#80d89e]"><span className="block h-px w-7 bg-[#75d49a]" /> Referanslarımız</p>
          <h2 className="mt-5 text-4xl font-extrabold leading-[1.04] tracking-[0.005em] text-[#f5faf4] sm:text-6xl">Markalarına<br /><em className="font-light tracking-[0.01em] text-[#8ce0ac]">dokunduk.</em></h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#d5efd9]/55">Farklı sektörlerden işletmeler için NFC kartları ve tek dokunuşluk dijital deneyimler tasarladık.</p>
        </div>

        <div
          ref={trackRef}
          onFocusCapture={() => { pausedRef.current = true; }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) pausedRef.current = false;
          }}
          className="mt-12 flex gap-3 overflow-x-auto py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Referanslarımız"
        >
          {[0, 1].map((groupIndex) => (
            <div
              key={groupIndex}
              className="grid shrink-0 auto-cols-[9.5rem] grid-flow-col grid-rows-2 gap-x-3 gap-y-5 max-[420px]:auto-cols-[8.5rem] sm:flex sm:gap-3"
              aria-hidden={groupIndex === 1}
            >
              {references.map((reference, index) => (
                <ReferenceItem
                  key={`${groupIndex}-${reference.name}-${index}`}
                  reference={reference}
                  onHoverStart={() => { pausedRef.current = true; }}
                  onHoverEnd={() => { pausedRef.current = false; }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
