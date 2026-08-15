import Redis from "ioredis";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code"); // লিংকের ?code=xxx অংশ থেকে কোডটি পড়বে
  
  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

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
        return new Response(`<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head></html>`, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
    }
  } catch (e) {
    console.error("Error:", e);
  }

  return new Response("Link not found or expired", { status: 404 });
}
