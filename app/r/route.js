import Redis from "ioredis";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  
  if (!code) return new Response("Missing code", { status: 400 });

  const redis = new Redis(process.env.REDIS_URL);
  
  try {
    const rawData = await redis.get(`short:${code}`);
    if (rawData) {
      const linkData = JSON.parse(rawData);
      const userAgent = request.headers.get("user-agent") || "";
      
      const country = request.headers.get("x-vercel-ip-country") || "Unknown";
      const today = new Date().toISOString().split("T")[0];

      let device = "Desktop";
      if (/mobile/i.test(userAgent)) device = "Mobile";
      else if (/ipad|tablet/i.test(userAgent)) device = "Tablet";

      let platform = "Other";
      if (/windows/i.test(userAgent)) platform = "Windows";
      else if (/macintosh|mac os x/i.test(userAgent)) platform = "Mac";
      else if (/iphone|ipad|ipod/i.test(userAgent)) platform = "iOS";
      else if (/android/i.test(userAgent)) platform = "Android";
      else if (/linux/i.test(userAgent)) platform = "Linux";

      const targetUrl = (/mobile|android|iphone|ipad/i.test(userAgent) && linkData.mobileUrl) ? linkData.mobileUrl : linkData.desktopUrl;

      if (targetUrl) {
        // গ্লোবাল কাউন্ট
        await redis.incr("total_visitors");
        await redis.incr(`visitors:date:${today}`);
        await redis.incr(`visitors:country:${country}`);
        await redis.incr(`visitors:device:${device}`);
        await redis.incr(`visitors:platform:${platform}`);

        // নির্দিষ্ট লিংকের জন্য আলাদা কাউন্ট
        await redis.incr(`link:clicks:${code}`);
        await redis.incr(`link:${code}:country:${country}`);
        await redis.incr(`link:${code}:device:${device}`);
        await redis.incr(`link:${code}:platform:${platform}`);

        return new Response(`<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head></html>`, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
    }
  } catch (e) {
    console.error(e);
  }

  return new Response("Link not found", { status: 404 });
}
