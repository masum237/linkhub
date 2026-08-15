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

    const userDataStr = await redis.get(`user:${email}`);
    if (!userDataStr) {
      return NextResponse.json({ success: false, error: "User not found!" }, { status: 400 });
    }

    const userData = JSON.parse(userDataStr);

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Invalid password!" }, { status: 400 });
    }

    // সঠিক নিয়মে কুকি সেট করার জন্য cookiesStore variable ব্যবহার করা হলো
    const cookieStore = cookies();
    cookieStore.set({
      name: "user_email",
      value: email,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login Server Error:", error.message);
    return NextResponse.json({ success: false, error: "Server Error: " + error.message }, { status: 500 });
  }
}
