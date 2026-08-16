import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);
export const revalidate = 0;

export async function GET(request) {
  try {
    const userEmail = request.cookies.get("user_email")?.value;

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rawLinks = await redis.lrange(`links:${userEmail}`, 0, -1);
    const userLinks = rawLinks.map((item) => JSON.parse(item));

    let totalVisitors = 0;
    const countries = {};
    const devices = {};
    const platforms = {};

    for (const link of userLinks) {
      const code = link.code;
      if (code) {
        const clicks = Number(await redis.get(`link:clicks:${code}`)) || 0;
        totalVisitors += clicks;

        const addSubDataToObj = async (pattern, targetObj) => {
          const subKeys = await redis.keys(pattern);
          for (const k of subKeys) {
            const val = Number(await redis.get(k)) || 0;
            const name = k.split(":").pop();
            targetObj[name] = (targetObj[name] || 0) + val;
          }
        };

        await addSubDataToObj(`link:${code}:country:*`, countries);
        await addSubDataToObj(`link:${code}:device:*`, devices);
        await addSubDataToObj(`link:${code}:platform:*`, platforms);
      }
    }

    // আজকের রিয়েল-টাইম ভিজিটর ফেচ করা
    const today = new Date().toISOString().split("T")[0];
    const todayVisitors = Number(await redis.get(`visitors:${today}`)) || 0;

    return NextResponse.json({
      totalLinks: userLinks.length,
      totalVisitors,
      todayVisitors,
      countries,
      devices,
      platforms,
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({
      totalLinks: 0,
      totalVisitors: 0,
      todayVisitors: 0,
      countries: {},
      devices: {},
      platforms: {},
    }, { status: 500 });
  }
}