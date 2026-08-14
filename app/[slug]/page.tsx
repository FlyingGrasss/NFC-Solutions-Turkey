import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import {
  FaArrowUpRightFromSquare,
  FaEnvelope,
  FaInstagram,
  FaLink,
  FaLinkedinIn,
  FaLocationDot,
  FaPhone,
  FaTelegram,
  FaWhatsapp,
} from "react-icons/fa6";
import { AddToContactsButton } from "@/components/add-to-contacts-button";
import { CopyIbanButton } from "@/components/copy-iban-button";
import { prisma } from "@/lib/db";
import {
  mailHref,
  normalizeProfileColorScheme,
  phoneHref,
  whatsappHref,
} from "@/lib/profile";
import { normalizeProfileButtonOrder } from "@/lib/profile-buttons";
import { absoluteUrl } from "@/lib/site";

type ProfilePageProps = {
  params: Promise<{ slug: string }>;
};

const themes = {
  forest: {
    background: "#06130f",
    glow: "#349757",
    accent: "#8de4a7",
    muted: "#e0f5e3",
    surface: "linear-gradient(135deg,rgb(102 143 111 / .34),rgb(27 65 40 / .75) 42%,rgb(7 27 17 / .86))",
    wideSurface: "linear-gradient(120deg,rgb(56 132 78 / .8),rgb(24 86 46 / .82) 52%,rgb(6 48 25 / .92))",
    border: "rgb(190 242 204 / .24)",
  },
  midnight: {
    background: "#071321",
    glow: "#3c6eaa",
    accent: "#9ecbff",
    muted: "#dbeafe",
    surface: "linear-gradient(135deg,rgb(73 103 139 / .35),rgb(21 43 72 / .78) 42%,rgb(7 19 36 / .9))",
    wideSurface: "linear-gradient(120deg,rgb(38 88 145 / .82),rgb(25 62 110 / .84) 52%,rgb(9 34 73 / .94))",
    border: "rgb(191 219 254 / .24)",
  },
  ocean: {
    background: "#06161b",
    glow: "#1d9bb2",
    accent: "#8de9ef",
    muted: "#d9fbfc",
    surface: "linear-gradient(135deg,rgb(78 143 154 / .35),rgb(19 71 82 / .78) 42%,rgb(5 27 35 / .9))",
    wideSurface: "linear-gradient(120deg,rgb(25 145 157 / .8),rgb(14 96 112 / .84) 52%,rgb(5 54 70 / .94))",
    border: "rgb(190 247 250 / .24)",
  },
  sand: {
    background: "#20170e",
    glow: "#bf8246",
    accent: "#f6d09c",
    muted: "#fff1dc",
    surface: "linear-gradient(135deg,rgb(158 119 74 / .4),rgb(93 61 33 / .78) 42%,rgb(40 24 13 / .9))",
    wideSurface: "linear-gradient(120deg,rgb(178 112 52 / .82),rgb(124 74 31 / .86) 52%,rgb(65 35 15 / .94))",
    border: "rgb(255 226 183 / .25)",
  },
  plum: {
    background: "#1b0c1c",
    glow: "#a65db2",
    accent: "#efb3f2",
    muted: "#fce7ff",
    surface: "linear-gradient(135deg,rgb(145 84 155 / .38),rgb(76 36 88 / .8) 42%,rgb(32 12 38 / .9))",
    wideSurface: "linear-gradient(120deg,rgb(158 65 168 / .8),rgb(109 45 125 / .86) 52%,rgb(58 18 72 / .94))",
    border: "rgb(245 208 255 / .25)",
  },
} as const;

async function getProfile(slug: string) {
  return prisma.profile.findUnique({
    where: { slug },
    include: {
      facilities: { orderBy: { sortOrder: "asc" } },
      customButtons: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile) {
    return { title: "Profil bulunamadı", robots: { index: false, follow: false } };
  }

  const description = [profile.title, profile.title2].filter(Boolean).join(" — ") || `${profile.name} dijital kartviziti`;
  const url = absoluteUrl(`/${profile.slug}`);
  const profileImage = profile.showImage && profile.imageUrl ? profile.imageUrl : absoluteUrl("/icon.png");

  return {
    title: profile.title ? `${profile.name} | ${profile.title}` : profile.name,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: profile.name, description, images: [{ url: profileImage, width: 512, height: 512, alt: profile.name }] },
    twitter: { card: "summary", title: profile.name, description, images: [profileImage] },
  };
}

function ProfileLinkButton({ href, label, icon, fullWidth, theme }: { href: string; label: string; icon: ReactNode; fullWidth: boolean; theme: (typeof themes)[keyof typeof themes] }) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`flex min-h-24 items-center justify-center gap-3 rounded-2xl border px-4 text-base font-medium text-slate-50 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.2),0_14px_30px_rgb(0_0_0_/_0.16)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--profile-accent)] sm:text-lg ${fullWidth ? "col-span-2" : ""}`}
      style={{ background: fullWidth ? theme.wideSurface : theme.surface, borderColor: theme.border } as CSSProperties}
    >
      <span className="grid min-h-10 min-w-12 place-items-center border-r border-white/25 pr-4 text-2xl" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile) {
    notFound();
  }

  const currentProfile = profile;
  const theme = themes[normalizeProfileColorScheme(profile.colorScheme)];
  const callHref = profile.callEnabled ? phoneHref(profile.callNumber) : null;
  const whatsappLink = profile.whatsappEnabled ? whatsappHref(profile.whatsappNumber) : null;
  const emailHref = profile.emailEnabled ? mailHref(profile.email) : null;
  const profileUrl = absoluteUrl(`/${profile.slug}`);
  const buttonOrder = normalizeProfileButtonOrder(
    profile.buttonOrder,
    profile.customButtons.map((button) => button.buttonKey),
  );
  const customButtons = new Map(profile.customButtons.map((button) => [button.buttonKey, button]));
  const themeStyle = { "--profile-accent": theme.accent } as CSSProperties;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: profile.name,
    url: profileUrl,
    mainEntity: {
      "@type": "Person",
      name: profile.name,
      jobTitle: profile.title || undefined,
      description: [profile.title, profile.title2].filter(Boolean).join(" — ") || undefined,
      image: profile.showImage ? profile.imageUrl || undefined : undefined,
      url: profileUrl,
      sameAs: [
        profile.instagramEnabled ? profile.instagramUrl : null,
        profile.linkedinEnabled ? profile.linkedinUrl : null,
        profile.telegramEnabled ? profile.telegramUrl : null,
      ].filter(Boolean),
    },
  };

  function renderButton(key: string) {
    const customButton = customButtons.get(key);

    if (customButton) {
      return <ProfileLinkButton key={key} href={customButton.url} label={customButton.label} icon={<FaLink />} fullWidth={customButton.fullWidth} theme={theme} />;
    }

    switch (key) {
      case "call":
        return callHref ? <ProfileLinkButton key={key} href={callHref} label="Ara" icon={<FaPhone />} fullWidth={currentProfile.callFullWidth} theme={theme} /> : null;
      case "whatsapp":
        return whatsappLink ? <ProfileLinkButton key={key} href={whatsappLink} label="WhatsApp" icon={<FaWhatsapp />} fullWidth={currentProfile.whatsappFullWidth} theme={theme} /> : null;
      case "telegram":
        return currentProfile.telegramEnabled && currentProfile.telegramUrl ? <ProfileLinkButton key={key} href={currentProfile.telegramUrl} label="Telegram" icon={<FaTelegram />} fullWidth={currentProfile.telegramFullWidth} theme={theme} /> : null;
      case "email":
        return emailHref ? <ProfileLinkButton key={key} href={emailHref} label="Mail" icon={<FaEnvelope />} fullWidth={currentProfile.emailFullWidth} theme={theme} /> : null;
      case "linkedin":
        return currentProfile.linkedinEnabled && currentProfile.linkedinUrl ? <ProfileLinkButton key={key} href={currentProfile.linkedinUrl} label="LinkedIn" icon={<FaLinkedinIn />} fullWidth={currentProfile.linkedinFullWidth} theme={theme} /> : null;
      case "contact":
        return currentProfile.contactEnabled ? <AddToContactsButton key={key} name={currentProfile.name} title={currentProfile.title} title2={currentProfile.title2} phone={currentProfile.callNumber} email={currentProfile.email} url={profileUrl} fullWidth={currentProfile.contactFullWidth} theme={theme} /> : null;
      case "location":
        return currentProfile.locationEnabled && currentProfile.locationUrl ? <ProfileLinkButton key={key} href={currentProfile.locationUrl} label="Konum" icon={<FaLocationDot />} fullWidth={currentProfile.locationFullWidth} theme={theme} /> : null;
      case "instagram":
        return currentProfile.instagramEnabled && currentProfile.instagramUrl ? <ProfileLinkButton key={key} href={currentProfile.instagramUrl} label="Instagram" icon={<FaInstagram />} fullWidth={currentProfile.instagramFullWidth} theme={theme} /> : null;
      case "iban":
        return currentProfile.ibanEnabled && currentProfile.iban ? <CopyIbanButton key={key} iban={currentProfile.iban} theme={theme} /> : null;
      default:
        return null;
    }
  }

  return (
    <main className="relative isolate min-h-svh overflow-x-hidden text-slate-50" style={{ ...themeStyle, backgroundColor: theme.background }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" style={{ background: `radial-gradient(ellipse 62% 42% at 95% 5%, ${theme.glow}52, transparent 70%), radial-gradient(ellipse 72% 58% at -8% 72%, ${theme.glow}42, transparent 72%), linear-gradient(128deg, ${theme.background} 0%, ${theme.background} 100%)` }} />
      <div className="relative z-10 mx-auto min-h-svh w-full max-w-3xl px-5 py-12 sm:px-12 sm:py-20">
        <header className="flex flex-col items-center text-center">
          {profile.showImage && profile.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.imageUrl} alt="" className="mb-8 max-h-32 w-auto max-w-full object-contain drop-shadow-[0_16px_30px_rgb(0_0_0_/_0.2)]" />
          ) : null}
          <h1 className="max-w-full break-words text-center text-[clamp(2.4rem,8vw,4.8rem)] font-light leading-none tracking-[0.04em]">{profile.name}</h1>
          {profile.title || profile.title2 ? <div className="my-7 h-px w-full max-w-md bg-gradient-to-r from-transparent via-[var(--profile-accent)]/65 to-transparent" /> : null}
          {profile.title ? <p className="text-[clamp(1rem,3vw,1.55rem)] leading-[1.45] text-[var(--profile-accent)]/75">{profile.title}</p> : null}
          {profile.title2 ? <p className="text-[clamp(1rem,3vw,1.55rem)] leading-[1.45] text-[var(--profile-accent)]/75">{profile.title2}</p> : null}
        </header>

        <section className="mt-12 grid grid-cols-2 gap-3 sm:gap-4" aria-label="İletişim seçenekleri">
          {buttonOrder.map(renderButton)}
        </section>

        {profile.facilities.length > 0 ? (
          <section className="mt-16 border-l-[3px] border-[var(--profile-accent)]/70 pl-5 sm:mt-20 sm:pl-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--profile-accent)]/80">{profile.facilitiesHeading}</h2>
            <div className="mt-5">
              {profile.facilities.map((facility) => (
                <a key={facility.id} href={facility.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 border-b border-[var(--profile-accent)]/15 py-4 text-base text-slate-200/80 transition hover:pl-1.5 hover:text-white sm:text-lg">
                  <span className="min-w-0 break-words">{facility.name}</span>
                  <FaArrowUpRightFromSquare aria-hidden="true" className="shrink-0 text-sm text-slate-200/50" />
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
