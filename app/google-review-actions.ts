"use server";

import { requireSession } from "@/lib/auth-helpers";

export type GoogleReviewLinkResult = {
  error?: string;
  reviewUrl?: string;
  placeId?: string;
  placeName?: string;
};

const reviewLinkBase = "https://search.google.com/local/writereview?placeid=";
const featureIdPattern = /^(0x[a-f0-9]+):(0x[a-f0-9]+)$/i;
const placeIdPattern = /^[A-Za-z][A-Za-z0-9_-]{7,}$/;
const shortGoogleHosts = new Set(["maps.app.goo.gl", "goo.gl"]);
const googleMapsHosts = new Set([
  "google.com",
  "www.google.com",
  "maps.google.com",
  "google.com.tr",
  "www.google.com.tr",
  "maps.google.com.tr",
]);

function parseUrl(value: string) {
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
}

function isGoogleMapsUrl(url: URL) {
  const host = url.hostname.toLowerCase();

  if (shortGoogleHosts.has(host)) {
    return /^\/maps\//.test(url.pathname) || host === "maps.app.goo.gl";
  }

  return googleMapsHosts.has(host) && url.pathname.startsWith("/maps");
}

function parseMapsUrl(value: string) {
  const url = parseUrl(value);
  return url && isGoogleMapsUrl(url) ? url : null;
}

function decodeRepeatedly(value: string) {
  let decoded = value;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }

  return decoded;
}

function normalizePlaceId(value: string) {
  const candidate = decodeRepeatedly(value.trim());
  return placeIdPattern.test(candidate) ? candidate : null;
}

function reviewUrlFromPlaceId(placeId: string) {
  return `${reviewLinkBase}${encodeURIComponent(placeId)}`;
}

function extractDirectReviewPlaceId(url: URL) {
  if (url.hostname.toLowerCase() !== "search.google.com" || !url.pathname.startsWith("/local/writereview")) {
    return null;
  }

  return normalizePlaceId(url.searchParams.get("placeid") ?? "");
}

function extractPlaceId(url: URL) {
  for (const parameter of ["placeid", "place_id", "query_place_id"]) {
    const placeId = normalizePlaceId(url.searchParams.get(parameter) ?? "");
    if (placeId) return placeId;
  }

  const query = decodeRepeatedly(url.searchParams.get("q") ?? "");
  const queryPlaceId = query.match(/^place_id:(.+)$/i)?.[1];
  const normalizedQueryPlaceId = normalizePlaceId(queryPlaceId ?? "");
  if (normalizedQueryPlaceId) return normalizedQueryPlaceId;

  const explicitPlaceId = url.href.match(/!1s([A-Za-z][A-Za-z0-9_-]{7,})(?=!|$)/)?.[1];
  return normalizePlaceId(explicitPlaceId ?? "");
}

function readLittleEndianBytes(value: bigint) {
  const bytes: number[] = [];
  let remaining = value;

  for (let index = 0; index < 8; index += 1) {
    bytes.push(Number(remaining & BigInt(255)));
    remaining >>= BigInt(8);
  }

  return bytes;
}

function placeIdFromFeatureId(featureId: string) {
  const match = featureId.match(featureIdPattern);
  if (!match) return null;

  try {
    const first = BigInt(match[1]);
    const second = BigInt(match[2]);
    const payload = [
      10,
      18,
      9,
      ...readLittleEndianBytes(first),
      17,
      ...readLittleEndianBytes(second),
    ];

    return Buffer.from(payload).toString("base64url");
  } catch {
    return null;
  }
}

function extractFeatureId(url: URL) {
  const decodedPath = decodeRepeatedly(url.pathname);
  const fromPath = decodedPath.match(/!1s(0x[a-f0-9]+):(0x[a-f0-9]+)/i);
  if (fromPath) return `${fromPath[1]}:${fromPath[2]}`;

  const fromFeatureId = decodeRepeatedly(url.searchParams.get("ftid") ?? "");
  return fromFeatureId.match(featureIdPattern)?.[0] ?? null;
}

function extractPlaceName(url: URL) {
  const match = decodeRepeatedly(url.pathname).match(/\/maps\/place\/([^/]+)/);
  return match?.[1]?.replace(/\+/g, " ") || undefined;
}

function resultForPlaceId(placeId: string, placeName?: string): GoogleReviewLinkResult {
  return {
    reviewUrl: reviewUrlFromPlaceId(placeId),
    placeId,
    placeName,
  };
}

export async function generateGoogleReviewLinkAction(
  formData: FormData,
): Promise<GoogleReviewLinkResult> {
  await requireSession();

  const value = formData.get("mapsUrl");

  if (typeof value !== "string" || !value.trim() || value.trim().length > 2_000) {
    return { error: "Google Maps bağlantısını veya Place ID bilgisini girin." };
  }

  const input = value.trim();
  const directPlaceId = normalizePlaceId(input);
  if (directPlaceId) return resultForPlaceId(directPlaceId);

  const inputUrl = parseUrl(input);
  if (inputUrl) {
    const directReviewPlaceId = extractDirectReviewPlaceId(inputUrl);
    if (directReviewPlaceId) return resultForPlaceId(directReviewPlaceId);
  }

  const firstUrl = parseMapsUrl(input);
  if (!firstUrl) {
    return { error: "Geçerli bir Google Maps bağlantısı veya Place ID girin." };
  }

  let currentUrl = firstUrl;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const placeId = extractPlaceId(currentUrl);
    if (placeId) return resultForPlaceId(placeId, extractPlaceName(currentUrl));

    const featureId = extractFeatureId(currentUrl);
    const convertedPlaceId = featureId ? placeIdFromFeatureId(featureId) : null;
    if (convertedPlaceId) return resultForPlaceId(convertedPlaceId, extractPlaceName(currentUrl));

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
    if (!location) return { error: "Google Maps yönlendirmesi okunamadı." };

    const nextUrl = parseMapsUrl(new URL(location, currentUrl).toString());
    if (!nextUrl) return { error: "Google Maps bağlantısı güvenli bir konuma yönlenmedi." };

    currentUrl = nextUrl;
  }

  return { error: "Google Maps bağlantısı çok fazla yönlendirme içeriyor." };
}
