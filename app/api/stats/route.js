import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);
export const revalidate = 0;

export async function GET() {
  try {
    const totalLinks = (await redis.get("total_links")) || 0;
    const totalVisitors = (await redis.get("total_visitors")) || 0;
    
    return NextResponse.json({ totalLinks: Number(totalLinks), totalVisitors: Number(totalVisitors) });
  } catch (error) {
    return NextResponse.json({ totalLinks: 0, totalVisitors: 0 });
  }
}
