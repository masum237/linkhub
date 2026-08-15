import Redis from "ioredis";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);

export async function POST(request) {
  try {
    const { subdomain, desktopUrl, mobileUrl } = await request.json();
    
    if (!subdomain || !desktopUrl || !mobileUrl) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const exists = await redis.get(`link:${subdomain}`);
    if (exists) {
      return NextResponse.json({ error: "Subdomain already taken" }, { status: 400 });
    }

    await redis.set(`link:${subdomain}`, JSON.stringify({ desktopUrl, mobileUrl }));
    await redis.incr("total_links");

    return NextResponse.json({ success: true, subdomain });
  } catch (error) {
    return NextResponse.json({ error: "Database Error: " + error.message }, { status: 500 });
  }
}
