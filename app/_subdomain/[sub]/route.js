import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);

export async function GET(request, { params }) {
  const subdomain = params.sub;
  const isMobile = request.nextUrl.searchParams.get('isMobile') === 'true';

  try {
    const rawData = await redis.get(`link:${subdomain}`);

    if (rawData) {
      await redis.incr("total_visitors");
      const linkData = JSON.parse(rawData);

      if (isMobile && linkData.mobileUrl) {
        return NextResponse.redirect(linkData.mobileUrl);
      } else if (!isMobile && linkData.desktopUrl) {
        return NextResponse.redirect(linkData.desktopUrl);
      }
    }
  } catch (error) {
    console.error("Redirect error:", error);
  }

  return NextResponse.redirect(new URL("/", request.url));
}
