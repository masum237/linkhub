import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const subdomain = params.sub;
  const isMobile = request.nextUrl.searchParams.get('isMobile') === 'true';

  // ডাটাবেস থেকে ডেটা আনা
  const linkData = await kv.get(`link:${subdomain}`);

  if (linkData) {
    // লিংকে ক্লিক পড়লে ভিজিটর কাউন্ট ১ বাড়ানো
    await kv.incr("total_visitors");

    if (isMobile && linkData.mobileUrl) {
      return NextResponse.redirect(linkData.mobileUrl);
    } else if (!isMobile && linkData.desktopUrl) {
      return NextResponse.redirect(linkData.desktopUrl);
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}
