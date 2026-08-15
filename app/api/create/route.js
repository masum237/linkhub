import redis from "../../../lib/redis"; // অথবা সরাসরি relative path ঠিক করে নিন
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

    await redis.set(`short:${code}`, JSON.stringify(linkData));
    await redis.incr("total_links");
    await redis.rpush(`links:${userEmail}`, JSON.stringify(linkData));

    return NextResponse.json({ success: true, code });
  } catch (error) {
    return NextResponse.json({ error: "Database Error: " + error.message }, { status: 500 });
  }
}
