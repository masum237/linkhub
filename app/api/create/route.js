import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);

export async function POST(request) {
  try {
    const { desktopUrl, mobileUrl } = await request.json();
    
    if (!desktopUrl || !mobileUrl) {
      return NextResponse.json({ error: "Both URLs are required" }, { status: 400 });
    }

    // সঠিক উপায়ে ৫ অক্ষরের ইউনিক কোড জেনারেট করা
    const code = Math.random().toString(36).substring(2, 7);

    await redis.set(`short:${code}`, JSON.stringify({ desktopUrl, mobileUrl }));
    await redis.incr("total_links");

    return NextResponse.json({ success: true, code });
  } catch (error) {
    return NextResponse.json({ error: "Database Error: " + error.message }, { status: 500 });
  }
}
