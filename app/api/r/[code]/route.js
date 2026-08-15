import Redis from "ioredis";

export async function GET(request, { params }) {
  const { code } = params;
  const redis = new Redis(process.env.REDIS_URL);
  
  try {
    const rawData = await redis.get(`short:${code}`);
    console.log(`Checking code: ${code}, Data found:`, rawData); // Vercel লগে দেখার জন্য

    if (rawData) {
      const linkData = JSON.parse(rawData);
      
      const userAgent = request.headers.get("user-agent") || "";
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      
      const targetUrl = (isMobile && linkData.mobileUrl) ? linkData.mobileUrl : linkData.desktopUrl;
      
      if (targetUrl) {
        await redis.incr("total_visitors");
        return Response.redirect(targetUrl, 302);
      }
    }
  } catch (e) {
    console.error("Redirect Error:", e);
  }

  // যদি লিংক না পাওয়া যায়, তবে হোম পেজে না পাঠিয়ে একটি মেসেজ বা সরাসরি হোমে রিডাইরেক্ট করবে
  return Response.redirect(new URL("/", request.url), 302);
}
