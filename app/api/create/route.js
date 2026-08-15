import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { subdomain, desktopUrl, mobileUrl } = await request.json();
    
    if (!subdomain || !desktopUrl || !mobileUrl) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const exists = await kv.get(`link:${subdomain}`);
    if (exists) {
      return NextResponse.json({ error: "Subdomain already taken" }, { status: 400 });
    }

    await kv.set(`link:${subdomain}`, { desktopUrl, mobileUrl });
    await kv.incr("total_links");

    return NextResponse.json({ success: true, subdomain });
  } catch (error) {
    return NextResponse.json({ error: "Database Connection Error. Please check Vercel KV bindings." }, { status: 500 });
  }
}
