import Redis from "ioredis";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const redis = new Redis(process.env.REDIS_URL);

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required!" }, { status: 400 });
    }

    // Redis থেকে ইউজারের ডেটা আনা
    const userDataStr = await redis.get(`user:${email}`);
    if (!userDataStr) {
      return NextResponse.json({ success: false, error: "User not found in database!" }, { status: 400 });
    }

    const userData = JSON.parse(userDataStr);

    // পাসওয়ার্ড ম্যাচ করছে কিনা চেক করা
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Invalid password!" }, { status: 400 });
    }

    // কুকি সেট করা
    cookies().set("user_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Login successful" });
  } catch (error) {
    // টার্মিনাল বা কনসোলে আসল এররটি প্রিন্ট করার জন্য
    console.error("Login Server Error:", error.message);
    return NextResponse.json({ success: false, error: "Server Error: " + error.message }, { status: 500 });
  }
}
