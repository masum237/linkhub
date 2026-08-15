import Redis from "ioredis";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const redis = new Redis(process.env.REDIS_URL);

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required!" }, { status: 400 });
    }

    const userDataStr = await redis.get(`user:${email}`);
    if (!userDataStr) {
      return NextResponse.json({ success: false, error: "User not found!" }, { status: 400 });
    }

    const userData = JSON.parse(userDataStr);

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Invalid password!" }, { status: 400 });
    }

    // NextResponse-এর মাধ্যমে কুকি সেট করা হলো যা Route Handler-এ কাজ করে
    const response = NextResponse.json({ success: true, message: "Login successful" });
    
    response.cookies.set({
      name: "user_email",
      value: email,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // ১ সপ্তাহ
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Server Error:", error.message);
    return NextResponse.json({ success: false, error: "Server Error: " + error.message }, { status: 500 });
  }
}
