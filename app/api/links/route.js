import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);
export const revalidate = 0;

export async function GET() {
  try {
    const keys = await redis.keys("short:*");
    const links = [];
    
    for (const key of keys) {
      const code = key.replace("short:", "");
      const data = await redis.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        const clicks = (await redis.get(`link:clicks:${code}`)) || 0;

        // নির্দিষ্ট লিংকের কান্ট্রি, ডিভাইস ও প্ল্যাটফর্ম ফেচ করা
        const fetchSubData = async (pattern) => {
          const subKeys = await redis.keys(pattern);
          const obj = {};
          for (const k of subKeys) {
            const val = await redis.get(k);
            const name = k.split(":").pop();
            obj[name] = Number(val) || 0;
          }
          return obj;
        };

        const countries = await fetchSubData(`link:${code}:country:*`);
        const devices = await fetchSubData(`link:${code}:device:*`);
        const platforms = await fetchSubData(`link:${code}:platform:*`);

        links.push({ 
          code, 
          clicks: Number(clicks), 
          countries, 
          devices, 
          platforms, 
          ...parsed 
        });
      }
    }
    return NextResponse.json({ success: true, links });
  } catch (error) {
    return NextResponse.json({ success: false, links: [] });
  }
}
