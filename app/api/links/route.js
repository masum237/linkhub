import Redis from "ioredis";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);
export const revalidate = 0;

export async function GET() {
  try {
    const cookieStore = cookies();
    const userEmail = cookieStore.get("user_email")?.value;

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized", links: [] }, { status: 401 });
    }

    // শুধুমাত্র এই ইউজারের লিস্টে থাকা লিংকগুলোর কোডগুলো আনা
    const rawLinks = await redis.lrange(`links:${userEmail}`, 0, -1);
    const links = [];

    for (const item of rawLinks) {
      const parsed = JSON.parse(item);
      const code = parsed.code;

      if (code) {
        // ক্লিকের সংখ্যা এবং সাব-ডাটা ফেচ করা
        const clicks = (await redis.get(`link:clicks:${code}`)) || 0;

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
          ...parsed,
          clicks: Number(clicks),
          countries,
          devices,
          platforms,
        });
      }
    }

    return NextResponse.json({ success: true, links });
  } catch (error) {
    return NextResponse.json({ success: false, links: [] }, { status: 500 });
  }
}
