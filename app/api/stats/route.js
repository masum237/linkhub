import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export const revalidate = 0; // ডেটা যেন ক্যাশ না ধরে রাখে

export async function GET() {
  try {
    const totalLinks = (await kv.get("total_links")) || 0;
    const totalVisitors = (await kv.get("total_visitors")) || 0;
    
    return NextResponse.json({ totalLinks, totalVisitors });
  } catch (error) {
    return NextResponse.json({ totalLinks: 0, totalVisitors: 0, error: "DB Error" });
  }
}
