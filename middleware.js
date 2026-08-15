import { NextResponse, userAgent } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host');

  // ভিজিটর মোবাইল নাকি পিসিতে আছে তা ডিটেক্ট করা
  const { device } = userAgent(req);
  const isMobile = device.type === 'mobile' || device.type === 'tablet';
  url.searchParams.set('isMobile', isMobile ? 'true' : 'false');

  // সাবডোমেইন রিরাইট লজিক (যাতে subdomain.domain.com কাজ করে)
  const currentHost = hostname.split(':')[0];
  
  // এটি আপনার মেইন ডোমেইন এবং লোকালহোস্ট ছাড়া অন্য সাবডোমেইনগুলো ধরবে
  if (!currentHost.includes('localhost') && currentHost.split('.').length > 2) {
    const subdomain = currentHost.split('.')[0];
    url.pathname = `/_subdomain/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
