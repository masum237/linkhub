import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);
export const revalidate = 0;

export async function GET(request) {
  try {
    // Next.js 15-এর রুলস অনুযায়ী request থেকে কুকি পড়া
    const userEmail = request.cookies.get("user_email")?.value;

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized", links: [] }, { status: 401 });
    }

    const rawLinks = await redis.lrange(`links:${userEmail}`, 0, -1);
    const links = [];

    for (const item of rawLinks) {
      const parsed = JSON.parse(item);
      const code = parsed.code;

      if (code) {
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

    // নতুন লিংকগুলো যেন সবার ওপরে দেখায় তাই reverse() করে দেওয়া হলো
    return NextResponse.json({ success: true, links: links.reverse() });
  } catch (error) {
    console.error("Links Fetch Error:", error);
    return NextResponse.json({ success: false, links: [] }, { status: 500 });
  }
}
