import Redis from "ioredis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// সরাসরি ফাইলের ভেতরেই সেফ Redis ইনস্ট্যান্স তৈরি করা হলো
const getRedisInstance = () => {
  return new Redis(process.env.REDIS_URL);
};

export async function POST(request) {
  const redis = getRedisInstance();
  try {
    const cookieStore = cookies();
    const userEmail = cookieStore.get("user_email")?.value;

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { desktopUrl, mobileUrl, desktopTitle, mobileTitle } = await request.json();
    
    if (!desktopUrl || !mobileUrl) {
      return NextResponse.json({ error: "Both URLs are required" }, { status: 400 });
    }

    // ৫ অক্ষরের ইউনিক কোড জেনারেট করা
    const code = Math.random().toString(36).substring(2, 7);

    const linkData = {
      code,
      desktopUrl,
      mobileUrl,
      desktopTitle: desktopTitle || "",
      mobileTitle: mobileTitle || "",
      createdAt: new Date().toISOString(),
    };

    // ১. গ্লোবাল ডাটাবেসে শর্ট কোড ও মোট লিংকের হিসাব সেভ করা
    await redis.set(`short:${code}`, JSON.stringify(linkData));
    await redis.incr("total_links");

    // ২. শুধুমাত্র বর্তমান ইউজারের নিজস্ব লিস্টে লিংকটি যুক্ত করা
    await redis.rpush(`links:${userEmail}`, JSON.stringify(linkData));

    // কানেকশন ক্লোজ করে দেওয়া যাতে মেমোরি লিক বা মেথড এরর না করে
    redis.quit();

    return NextResponse.json({ success: true, code });
  } catch (error) {
    redis.quit();
    return NextResponse.json({ error: "Database Error: " + error.message }, { status: 500 });
  }
}
