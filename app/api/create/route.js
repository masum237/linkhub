import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);

export async function POST(request) {
  try {
    // Next.js 15-এর রুলস অনুযায়ী request অবজেক্ট থেকে সরাসরি কুকি পড়া হচ্ছে
    const userEmail = request.cookies.get("user_email")?.value;

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { desktopUrl, mobileUrl, desktopTitle, mobileTitle } = await request.json();
    
    if (!desktopUrl || !mobileUrl) {
      return NextResponse.json({ error: "Both URLs are required" }, { status: 400 });
    }

    const code = Math.random().toString(36).substring(2, 7);

    const linkData = {
      code,
      desktopUrl,
      mobileUrl,
      desktopTitle: desktopTitle || "",
      mobileTitle: mobileTitle || "",
      createdAt: new Date().toISOString(),
    };

    // ডাটাবেসে সেভ করা
    await redis.set(`short:${code}`, JSON.stringify(linkData));
    await redis.incr("total_links");
    await redis.rpush(`links:${userEmail}`, JSON.stringify(linkData));

    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error("Create API Error:", error);
    return NextResponse.json({ error: "Database Error: " + error.message }, { status: 500 });
  }
}
