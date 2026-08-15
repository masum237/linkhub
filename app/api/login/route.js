import Redis from "ioredis";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Redis থেকে ইউজারের ডেটা খোঁজা
    const userDataStr = await redis.get(`user:${email}`);
    if (!userDataStr) {
      return NextResponse.json({ success: false, error: "User not found!" }, { status: 400 });
    }

    const userData = JSON.parse(userDataStr);

    // পাসওয়ার্ড ম্যাচ করছে কিনা চেক করা
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Invalid password!" }, { status: 400 });
    }

    // সফল হলে রেসপন্স পাঠানো
    return NextResponse.json({ success: true, message: "Login successful" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
