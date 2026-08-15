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
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // ১. শুধুমাত্র এই ইউজারের নিজস্ব লিংকগুলোর লিস্ট আনা
    const rawLinks = await redis.lrange(`links:${userEmail}`, 0, -1);
    const userLinks = rawLinks.map((item) => JSON.parse(item));

    let totalVisitors = 0;
    const countries = {};
    const devices = {};
    const platforms = {};

    // ২. শুধু এই ইউজারের লিংকগুলোর ক্লিক এবং অ্যানালিটিক্স যোগ করা
    for (const link of userLinks) {
      const code = link.code;
      if (code) {
        const clicks = Number(await redis.get(`link:clicks:${code}`)) || 0;
        totalVisitors += clicks;

        // কান্ট্রি, ডিভাইস ও প্ল্যাটফর্ম ডাটা সংগ্রহ করা
        const fetchSubData = async (pattern) => {
          const subKeys = await redis.keys(pattern);
          for (const k of subKeys) {
            const val = Number(await redis.get(k)) || 0;
            const name = k.split(":").pop();
            return { name, val };
          }
          return null;
        };

        // সাব-ডাটাগুলো অবজেক্টে যোগ করার লজিক
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

    return NextResponse.json({
      totalLinks: userLinks.length,
      totalVisitors,
      todayVisitors: 0, // চাইলে দিনভিত্তিক ক্যালকুলেশন রাখতে পারেন
      countries,
      devices,
      platforms,
    });
  } catch (error) {
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
