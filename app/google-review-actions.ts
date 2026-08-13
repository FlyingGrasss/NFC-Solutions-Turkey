"use server";

import { requireSession } from "@/lib/auth-helpers";

export type GoogleReviewLinkResult = {
  error?: string;
  reviewUrl?: string;
  placeName?: string;
};

const allowedHosts = new Set([
  "maps.app.goo.gl",
  "maps.google.com",
  "google.com",
  "www.google.com",
  "google.com.tr",
  "www.google.com.tr",
]);

function parseMapsUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:" || !allowedHosts.has(url.hostname.toLowerCase())) {
      return null;
    }

    if (url.hostname.toLowerCase().includes("google.com") && !url.pathname.startsWith("/maps")) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function extractMapsToken(url: URL) {
  const match = url.href.match(/!1s([^!]+)/);

  if (!match?.[1]) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function reviewUrlFromToken(token: string) {
  return `https://www.google.com/maps/place//data=!4m3!3m2!1s${token}!12e1`;
}

function extractPlaceName(url: URL) {
  const match = url.pathname.match(/\/maps\/place\/([^/]+)/);

  if (!match?.[1]) {
    return undefined;
  }

  try {
    return decodeURIComponent(match[1].replace(/\+/g, " "));
  } catch {
    return undefined;
  }
}

export async function generateGoogleReviewLinkAction(
  formData: FormData,
): Promise<GoogleReviewLinkResult> {
  await requireSession();

  const value = formData.get("mapsUrl");

  if (typeof value !== "string" || !value.trim() || value.trim().length > 2_000) {
    return { error: "Google Maps bağlantısını girin." };
  }

  const firstUrl = parseMapsUrl(value.trim());

  if (!firstUrl) {
    return { error: "Geçerli bir Google Maps bağlantısı girin." };
  }

  let currentUrl = firstUrl;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = extractMapsToken(currentUrl);

    if (token) {
      return {
        reviewUrl: reviewUrlFromToken(token),
        placeName: extractPlaceName(currentUrl),
      };
    }

    let response: Response;

    try {
      response = await fetch(currentUrl, {
        headers: { "user-agent": "NFC Solutions Turkey admin" },
        redirect: "manual",
        cache: "no-store",
      });
    } catch {
      return { error: "Google Maps bağlantısı okunamadı. Bağlantıyı kontrol edin." };
    }

    if (response.status < 300 || response.status >= 400) {
      return {
        error: "Bu bağlantıda bir işletme konumu bulunamadı. Google Maps'ten işletme bağlantısını kopyalayın.",
      };
    }

    const location = response.headers.get("location");

    if (!location) {
      return { error: "Google Maps yönlendirmesi okunamadı." };
    }

    const nextUrl = parseMapsUrl(new URL(location, currentUrl).toString());

    if (!nextUrl) {
      return { error: "Google Maps bağlantısı güvenli bir konuma yönlenmedi." };
    }

    currentUrl = nextUrl;
  }

  return { error: "Google Maps bağlantısı çok fazla yönlendirme içeriyor." };
}
