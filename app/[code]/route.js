import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);

export async function GET(request, { params }) {
  const { code } = params;
  
  try {
    const rawData = await redis.get(`short:${code}`);
    if (rawData) {
      await redis.incr("total_visitors");
      const linkData = JSON.parse(rawData);
      
      const userAgent = request.headers.get("user-agent") || "";
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);

      const targetUrl = isMobile && linkData.mobileUrl ? linkData.mobileUrl : linkData.desktopUrl;
      return NextResponse.redirect(targetUrl);
    }
  } catch (error) {
    console.error(error);
  }

  return NextResponse.redirect(new URL("/", request.url));
}
