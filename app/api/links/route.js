import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);
export const revalidate = 0;

export async function GET() {
  try {
    const keys = await redis.keys("link:*");
    const links = [];
    for (const key of keys) {
      const subdomain = key.replace("link:", "");
      const data = await redis.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        links.push({ subdomain, ...parsed });
      }
    }
    return NextResponse.json({ success: true, links });
  } catch (error) {
    return NextResponse.json({ success: false, links: [] });
  }
}
