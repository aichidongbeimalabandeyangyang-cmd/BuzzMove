import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/server/supabase/middleware";
import { STRICT_COUNTRIES } from "@/lib/constants";

export async function middleware(request: NextRequest) {
  // Geo-block restricted countries
  const country = request.headers.get("x-vercel-ip-country") ?? (request as any).geo?.country;
  if (country && (STRICT_COUNTRIES as readonly string[]).includes(country)) {
    return new NextResponse("Access denied", { status: 451 });
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
