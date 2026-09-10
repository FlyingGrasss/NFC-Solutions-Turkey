"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { requireMember, requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { getPartnerMembers } from "@/lib/finance";

export type GoogleReviewLinkResult = { error?: string; reviewUrl?: string; placeId?: string; placeName?: string; leadId?: string; duplicate?: boolean };
const reviewLinkBase = "https://search.google.com/local/writereview?placeid=";
const featureIdPattern = /^(0x[a-f0-9]+):(0x[a-f0-9]+)$/i;
const placeIdPattern = /^[A-Za-z][A-Za-z0-9_-]{7,}$/;
const shortGoogleHosts = new Set(["maps.app.goo.gl", "goo.gl"]);
const googleMapsHosts = new Set(["google.com", "www.google.com", "maps.google.com", "google.com.tr", "www.google.com.tr", "maps.google.com.tr"]);

function parseUrl(value: string) { try { return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`); } catch { return null; } }
function isGoogleMapsUrl(url: URL) { const host = url.hostname.toLowerCase(); return shortGoogleHosts.has(host) || (googleMapsHosts.has(host) && url.pathname.startsWith("/maps")); }
function decodeRepeatedly(value: string) { let decoded = value; for (let attempt = 0; attempt < 2; attempt += 1) { try { const next = decodeURIComponent(decoded); if (next === decoded) break; decoded = next; } catch { break; } } return decoded; }
function normalizePlaceId(value: string) { const candidate = decodeRepeatedly(value.trim()); return placeIdPattern.test(candidate) ? candidate : null; }
function reviewUrlFromPlaceId(placeId: string) { return `${reviewLinkBase}${encodeURIComponent(placeId)}`; }
function extractDirectReviewPlaceId(url: URL) { return url.hostname.toLowerCase() === "search.google.com" && url.pathname.startsWith("/local/writereview") ? normalizePlaceId(url.searchParams.get("placeid") ?? "") : null; }
function extractPlaceId(url: URL) {
  for (const parameter of ["placeid", "place_id", "query_place_id"]) { const id = normalizePlaceId(url.searchParams.get(parameter) ?? ""); if (id) return id; }
  const queryId = normalizePlaceId(decodeRepeatedly(url.searchParams.get("q") ?? "").match(/^place_id:(.+)$/i)?.[1] ?? "");
  return queryId ?? normalizePlaceId(url.href.match(/!1s([A-Za-z][A-Za-z0-9_-]{7,})(?=!|$)/)?.[1] ?? "");
}
function readLittleEndianBytes(value: bigint) { const bytes: number[] = []; let remaining = value; for (let i = 0; i < 8; i += 1) { bytes.push(Number(remaining & BigInt(255))); remaining >>= BigInt(8); } return bytes; }
function placeIdFromFeatureId(featureId: string) { const match = featureId.match(featureIdPattern); if (!match) return null; try { return Buffer.from([10, 18, 9, ...readLittleEndianBytes(BigInt(match[1])), 17, ...readLittleEndianBytes(BigInt(match[2]))]).toString("base64url"); } catch { return null; } }
function extractFeatureId(url: URL) { const path = decodeRepeatedly(url.pathname).match(/!1s(0x[a-f0-9]+):(0x[a-f0-9]+)/i); return path ? `${path[1]}:${path[2]}` : decodeRepeatedly(url.searchParams.get("ftid") ?? "").match(featureIdPattern)?.[0] ?? null; }
function cleanPlaceName(value?: string) { return (value ?? "İsimsiz işletme").replace(/\+/g, " ").replace(/\s*[|·-]\s*Google Maps.*$/i, "").replace(/\s+/g, " ").trim().slice(0, 120) || "İsimsiz işletme"; }
function extractPlaceName(url: URL) { return cleanPlaceName(decodeRepeatedly(url.pathname).match(/\/maps\/place\/([^/]+)/)?.[1]); }
function resolveFromUrl(url: URL) { const feature = extractFeatureId(url); const placeId = extractDirectReviewPlaceId(url) ?? extractPlaceId(url) ?? (feature ? placeIdFromFeatureId(feature) : null); return placeId ? { placeId, placeName: extractPlaceName(url) } : null; }

export async function generateGoogleReviewLinkAction(formData: FormData): Promise<GoogleReviewLinkResult> {
  const session = await requireSession();
  const member = await requireMember();
  const value = formData.get("mapsUrl");
  const together = member.role === "ADMIN" && formData.get("together") === "true";
  if (typeof value !== "string" || !value.trim() || value.trim().length > 2_000) return { error: "Google Maps bağlantısını veya Place ID bilgisini girin." };
  const input = value.trim();

  const cached = await prisma.lead.findFirst({ where: { userId: session.user.id, source: "COLD_WALK_IN", sourceMapsUrl: input, googlePlaceId: { not: null } }, select: { id: true, personName: true, googlePlaceId: true, googleReviewUrl: true } });
  if (cached?.googlePlaceId && cached.googleReviewUrl) return { leadId: cached.id, placeId: cached.googlePlaceId, placeName: cached.personName, reviewUrl: cached.googleReviewUrl, duplicate: true };

  let resolved: { placeId: string; placeName: string } | null = null;
  const directPlaceId = normalizePlaceId(input);
  if (directPlaceId) resolved = { placeId: directPlaceId, placeName: "İsimsiz işletme" };
  const inputUrl = parseUrl(input);
  if (!resolved && inputUrl) resolved = resolveFromUrl(inputUrl);
  if (!resolved) {
    if (!inputUrl || !isGoogleMapsUrl(inputUrl)) return { error: "Geçerli bir Google Maps bağlantısı veya Place ID girin." };
    try {
      const response = await fetch(inputUrl, { headers: { "user-agent": "NFC Solutions Turkey admin" }, redirect: "follow", cache: "no-store" });
      resolved = resolveFromUrl(new URL(response.url));
    } catch { return { error: "Google Maps bağlantısı okunamadı. Bağlantıyı kontrol edin." }; }
  }
  if (!resolved) return { error: "Bu bağlantıda bir işletme konumu bulunamadı." };

  const reviewUrl = reviewUrlFromPlaceId(resolved.placeId);
  const partners = together ? getPartnerMembers(await prisma.member.findMany({ select: { id: true, name: true } })) : [member];
  try {
    const lead = await prisma.lead.create({
      data: { type: "CALL", source: "COLD_WALK_IN", stage: "UNCLASSIFIED", personName: resolved.placeName, googlePlaceId: resolved.placeId, googleReviewUrl: reviewUrl, sourceMapsUrl: input, wasSold: false, createdByMemberId: member.id, userId: session.user.id, participants: { create: partners.map((partner) => ({ memberId: partner.id })) } },
      select: { id: true },
    });
    revalidatePath("/admin");
    return { leadId: lead.id, placeId: resolved.placeId, placeName: resolved.placeName, reviewUrl };
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const existing = await prisma.lead.findFirst({ where: { userId: session.user.id, googlePlaceId: resolved.placeId }, select: { id: true, personName: true, googleReviewUrl: true } });
    return { leadId: existing?.id, placeId: resolved.placeId, placeName: existing?.personName ?? resolved.placeName, reviewUrl: existing?.googleReviewUrl ?? reviewUrl, duplicate: true };
  }
}
