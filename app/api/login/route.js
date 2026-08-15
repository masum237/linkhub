import Redis from "ioredis";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // কুকি ব্যবহারের জন্য এটি জরুরি

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

    // পাসওয়ার্ড ম্যাচ করছে কিনা চেক করা
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Invalid password!" }, { status: 400 });
    }

    // 🔥 সবচেয়ে গুরুত্বপূর্ণ অংশ: লগইন সফল হলে কুকিতে ইউজারের ইমেইল সেট করে দেওয়া
    cookies().set("user_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // ১ সপ্তাহ পর্যন্ত লগইন থাকবে
      path: "/",
    });

    // সফল হলে রেসপন্স পাঠানো
    return NextResponse.json({ success: true, message: "Login successful" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
