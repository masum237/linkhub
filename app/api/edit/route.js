import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);

export async function POST(request) {
  try {
    const { code, desktopUrl, mobileUrl } = await request.json();
    
    const existingData = await redis.get(`short:${code}`);
    if (!existingData) {
      return NextResponse.json({ success: false, error: "Link not found" });
    }

    const parsed = JSON.parse(existingData);
    parsed.desktopUrl = desktopUrl;
    parsed.mobileUrl = mobileUrl;

    // পুরনো কোড ঠিক রেখেই শুধু ইউআরএলগুলো আপডেট করবে
    await redis.set(`short:${code}`, JSON.stringify(parsed));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
