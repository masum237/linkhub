import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);

export async function POST(request) {
  try {
    // Next.js 15-এর রুলস অনুযায়ী request থেকে কুকি পড়া
    const userEmail = request.cookies.get("user_email")?.value;

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    // ১. ডাটাবেস থেকে লিংকের মূল ডেটা মুছে ফেলা
    await redis.del(`short:${code}`);
    await redis.decr("total_links");

    // ২. ইউজারের লিস্ট থেকে লিংকটি খুঁজে বের করে মুছে ফেলা
    const listKey = `links:${userEmail}`;
    const rawLinks = await redis.lrange(listKey, 0, -1);
    
    let targetItem = null;
    for (const item of rawLinks) {
      const parsed = JSON.parse(item);
      if (parsed.code === code) {
        targetItem = item;
        break;
      }
    }

    if (targetItem) {
      // redis.lrem এর মাধ্যমে লিস্ট থেকে ডাটা রিমুভ করা হয়
      await redis.lrem(listKey, 0, targetItem);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
