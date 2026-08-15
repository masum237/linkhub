import Redis from "ioredis";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { code } = params;
  const redis = new Redis(process.env.REDIS_URL);
  
  try {
    const rawData = await redis.get(`short:${code}`);

    if (rawData) {
      const linkData = JSON.parse(rawData);
      
      const userAgent = request.headers.get("user-agent") || "";
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      
      const targetUrl = (isMobile && linkData.mobileUrl) ? linkData.mobileUrl : linkData.desktopUrl;

      if (targetUrl) {
        await redis.incr("total_visitors");
        // Next.js এর নিজস্ব সঠিক রিডাইরেক্ট মেথড
        return NextResponse.redirect(targetUrl, { status: 302 });
      }
    }
  } catch (e) {
    console.error("Redirect Error:", e);
  }

  return NextResponse.redirect(new URL("/", request.url), { status: 302 });
}
