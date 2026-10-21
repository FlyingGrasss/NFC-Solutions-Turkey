import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const shortLink = await prisma.shortLink.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { targetUrl: true },
  });

  if (!shortLink) {
    return new Response("Kısa bağlantı bulunamadı.", { status: 404 });
  }

  return NextResponse.redirect(new URL(shortLink.targetUrl), 302);
}
