import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { subdomain, desktopUrl, mobileUrl } = await request.json();
    
    if (!subdomain || !desktopUrl || !mobileUrl) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // সাবডোমেইনটি আগে থেকেই ডাটাবেসে আছে কিনা চেক করা
    const exists = await kv.get(subdomain);
    if (exists) {
      return NextResponse.json({ error: "Subdomain already taken" }, { status: 400 });
    }

    // ডাটাবেসে সেভ করা (Key = subdomain, Value = urls)
    await kv.set(subdomain, { desktopUrl, mobileUrl });

    return NextResponse.json({ success: true, subdomain });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
