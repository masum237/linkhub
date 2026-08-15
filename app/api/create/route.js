import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
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

    const code = Math.random().toString(36).substring(2, 7);

    const linkData = {
      code,
      desktopUrl,
      mobileUrl,
      desktopTitle: desktopTitle || "",
      mobileTitle: mobileTitle || "",
      createdAt: new Date().toISOString(),
    };

    // সরাসরি Redis REST API ব্যবহার করার ফাংশন (কোনো প্যাকেজ বা ক্লাস ছাড়াই কাজ করবে)
    const redisUrl = process.env.REDIS_URL; 
    // লক্ষ্য করুন: যদি আপনার REDIS_URL টি rediss:// বা redis:// ফরম্যাটের হয়, তবে Vercel-এ Upstash REST URL ব্যবহার করা সবচেয়ে ভালো।
    // অথবা সরাসরি fetch দিয়ে Upstash কমান্ড রিকোয়েস্ট পাঠানো যায়।

    // নিচে Upstash REST API এর মাধ্যমে ডাটা সেভ করার কোড দেওয়া হলো (যদি Upstash ব্যবহার করে থাকেন):
    // যদি আপনার REDIS_URL টি Upstash REST URL না হয়ে সাধারণ Redis URL হয়, তবে নিচে অন্য পদ্ধতি দিচ্ছি।
    
    // চলুন একদম সহজ নেটিভ পদ্ধতিতে ফেচ রিকোয়েস্টের মাধ্যমে করি:
    // আপনার Vercel Environment Variables এ REDIS_URL এর পাশাপাশি UPSTASH_REDIS_REST_URL এবং UPSTASH_REDIS_REST_TOKEN থাকলে নিচের কোডটি সুপার ফাস্ট কাজ করবে:

    const redisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (redisRestUrl && redisToken) {
      // ১. short:${code} সেভ করা
      await fetch(`${redisRestUrl}/set/short:${code}/${encodeURIComponent(JSON.stringify(linkData))}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
      });

      // ২. total_links বাড়ানো
      await fetch(`${redisRestUrl}/incr/total_links`, {
        headers: { Authorization: `Bearer ${redisToken}` },
      });

      // ৩. ইউজারের লিস্টে পুশ করা (rpush)
      await fetch(`${redisRestUrl}/rpush/links:${userEmail}/${encodeURIComponent(JSON.stringify(linkData))}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
      });
    } else {
      // যদি রিমোট রেস্ট এপিআই না থাকে, তবে সাধারণ পদ্ধতিতে ioredis দিয়ে ব্যাকআপ
      const Redis = (await import("ioredis")).default;
      const client = new Redis(process.env.REDIS_URL);
      
      await client.set(`short:${code}`, JSON.stringify(linkData));
      await client.incr("total_links");
      await client.rpush(`links:${userEmail}`, JSON.stringify(linkData));
      await client.quit();
    }

    return NextResponse.json({ success: true, code });
  } catch (error) {
    return NextResponse.json({ error: "Database Error: " + error.message }, { status: 500 });
  }
}
