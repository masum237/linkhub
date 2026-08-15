import Redis from "ioredis";

export async function GET(request, { params }) {
  const { code } = params;
  const redis = new Redis(process.env.REDIS_URL);
  
  try {
    const rawData = await redis.get(`short:${code}`);
    if (rawData) {
      // ভিজিটর কাউন্ট বাড়ানো
      await redis.incr("total_visitors");
      
      const linkData = JSON.parse(rawData);
      
      // ইউজার এজেন্ট চেক করা (মোবাইল নাকি ডেস্কটপ)
      const userAgent = request.headers.get("user-agent") || "";
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      
      const targetUrl = (isMobile && linkData.mobileUrl) ? linkData.mobileUrl : linkData.desktopUrl;
      
      // নিশ্চিত রিডাইরেক্ট
      return Response.redirect(targetUrl, 302);
    }
  } catch (e) {
    console.error("Redirect Error:", e);
  }

  // যদি লিংক না পাওয়া যায় তবে হোমে পাঠাবে
  return Response.redirect(new URL("/", request.url), 302);
}
