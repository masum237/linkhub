import Redis from "ioredis";

export async function GET(request, { params }) {
  const { code } = params;
  const redis = new Redis(process.env.REDIS_URL);
  
  try {
    const rawData = await redis.get(`short:${code}`);
    console.log(`Searching for key: short:${code}, Result:`, rawData);

    if (rawData) {
      const linkData = JSON.parse(rawData);
      const userAgent = request.headers.get("user-agent") || "";
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      const targetUrl = (isMobile && linkData.mobileUrl) ? linkData.mobileUrl : linkData.desktopUrl;

      if (targetUrl) {
        // ১. মোট এবং আজকের ভিজিটর কাউন্ট বাড়ানো
        await redis.incr("total_visitors");
        const today = new Date().toISOString().split("T")[0];
        await redis.incr(`visitors:${today}`);

        // ২. এই নির্দিষ্ট লিঙ্কের ক্লিক কাউন্ট বাড়ানো
        await redis.incr(`link:clicks:${code}`);

        // ৩. ডিভাইস ও প্ল্যাটফর্ম ট্র্যাক করা
        const deviceType = isMobile ? "Mobile" : "Desktop";
        await redis.incr(`link:${code}:device:${deviceType}`);

        const platform = /windows/i.test(userAgent) ? "Windows" : /mac/i.test(userAgent) ? "Mac" : /android/i.test(userAgent) ? "Android" : /iphone|ipad/i.test(userAgent) ? "iOS" : "Unknown";
        await redis.incr(`link:${code}:platform:${platform}`);

        return new Response(`<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head></html>`, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
    } else {
      return new Response(`Link not found in Redis for code: ${code}`, { status: 404 });
    }
  } catch (e) {
    console.error("Error:", e);
    return new Response(`Error: ${e.message}`, { status: 500 });
  }

  return new Response("Link not found", { status: 404 });
}