import Redis from "ioredis";

export async function GET(request, { params }) {
  const { code } = params;
  const redis = new Redis(process.env.REDIS_URL);
  
  try {
    const rawData = await redis.get(`short:${code}`);
    if (rawData) {
      const linkData = JSON.parse(rawData);
      const userAgent = request.headers.get("user-agent") || "";
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      const targetUrl = (isMobile && linkData.mobileUrl) ? linkData.mobileUrl : linkData.desktopUrl;

      if (targetUrl) {
        await redis.incr("total_visitors");
        
        // HTML Meta Refresh ব্যবহার করছি, যা রিডাইরেক্টের গ্যারান্টি দেয়
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
