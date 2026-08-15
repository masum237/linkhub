import Redis from "ioredis";

export async function GET(request, { params }) {
  const { code } = params;
  const redis = new Redis(process.env.REDIS_URL);
  
  try {
    // Redis থেকে সব কি (keys) চেক করার জন্য বা স্পেসিফিক কি ফেচ করার জন্য
    const rawData = await redis.get(`short:${code}`);
    console.log(`Searching for key: short:${code}, Result:`, rawData);

    if (rawData) {
      const linkData = JSON.parse(rawData);
      const userAgent = request.headers.get("user-agent") || "";
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      const targetUrl = (isMobile && linkData.mobileUrl) ? linkData.mobileUrl : linkData.desktopUrl;

      if (targetUrl) {
        await redis.incr("total_visitors");
        return new Response(`<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head></html>`, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
    } else {
      // যদি ডাটা না পাওয়া যায়, তবে ব্রাউজারে বা লগে কারণ দেখাবে
      return new Response(`Link not found in Redis for code: ${code}`, { status: 404 });
    }
  } catch (e) {
    console.error("Error:", e);
    return new Response(`Error: ${e.message}`, { status: 500 });
  }

  return new Response("Link not found", { status: 404 });
}
