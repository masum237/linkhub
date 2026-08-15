import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { subdomain, desktopUrl, mobileUrl } = await request.json();
    
    if (!subdomain || !desktopUrl || !mobileUrl) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // সাবডোমেইনটি আগে থেকেই আছে কিনা চেক করা (prefix দিয়ে সেভ করছি যেন অন্য ডেটার সাথে মিক্স না হয়)
    const exists = await kv.get(`link:${subdomain}`);
    if (exists) {
      return NextResponse.json({ error: "Subdomain already taken" }, { status: 400 });
    }

    // ডাটাবেসে সেভ করা 
    await kv.set(`link:${subdomain}`, { desktopUrl, mobileUrl });
    
    // টোটাল লিংক কাউন্টার ১ বাড়ানো
    await kv.incr("total_links");

    return NextResponse.json({ success: true, subdomain });
  } catch (error) {
    // সার্ভার এরর হলে ক্লিয়ারলি দেখাবে কেন হচ্ছে
    return NextResponse.json({ error: "Database Error: Please check Vercel KV connection" }, { status: 500 });
  }
}
