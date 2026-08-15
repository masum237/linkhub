import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);
export const revalidate = 0;

export async function GET() {
  try {
    const totalLinks = (await redis.get("total_links")) || 0;
    const totalVisitors = (await redis.get("total_visitors")) || 0;

    const today = new Date().toISOString().split("T")[0];
    const todayVisitors = (await redis.get(`visitors:date:${today}`)) || 0;

    // দেশ, ডিভাইস ও প্ল্যাটফর্মের ডাটা নিরাপদভাবে রিড করা
    const fetchHashData = async (pattern) => {
      const keys = await redis.keys(pattern);
      const data = {};
      for (const k of keys) {
        const val = await redis.get(k);
        const name = k.split(":").pop();
        data[name] = Number(val) || 0;
      }
      return data;
    };

    const countries = await fetchHashData("visitors:country:*");
    const devices = await fetchHashData("visitors:device:*");
    const platforms = await fetchHashData("visitors:platform:*");

    return NextResponse.json({
      success: true,
      totalLinks: Number(totalLinks),
      totalVisitors: Number(totalVisitors),
      todayVisitors: Number(todayVisitors),
      countries,
      devices,
      platforms
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
