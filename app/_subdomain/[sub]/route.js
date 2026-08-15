import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const subdomain = params.sub;
  const isMobile = request.nextUrl.searchParams.get('isMobile') === 'true';

  // ডাটাবেস থেকে ওই সাবডোমেইনের ডেটা (ডেস্কটপ ও মোবাইল লিংক) নিয়ে আসা
  const linkData = await kv.get(subdomain);

  if (linkData) {
    // ডিভাইস অনুযায়ী রিডাইরেক্ট করা
    if (isMobile && linkData.mobileUrl) {
      return NextResponse.redirect(linkData.mobileUrl);
    } else if (!isMobile && linkData.desktopUrl) {
      return NextResponse.redirect(linkData.desktopUrl);
    }
  }

  // যদি লিংক না পাওয়া যায়, তাহলে মেইন পেজে বা ড্যাশবোর্ডে পাঠিয়ে দেবে
  return NextResponse.redirect(new URL("/", request.url));
}
