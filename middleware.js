import { NextResponse, userAgent } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // ভিজিটর মোবাইল নাকি পিসিতে আছে তা ডিটেক্ট করা
  const { device } = userAgent(req);
  const isMobile = device.type === 'mobile' || device.type === 'tablet';
  url.searchParams.set('isMobile', isMobile ? 'true' : 'false');

  const currentHost = hostname.split(':')[0];
  
  // Vercel-এর মেইন ডোমেইন এবং লোকালহোস্ট ইগনোর করার লজিক
  const isVercelApp = currentHost.endsWith('.vercel.app');
  const isLocalhost = currentHost.includes('localhost');
  const domainParts = currentHost.split('.');

  // যদি Vercel অ্যাপ না হয় এবং ডোমেইনে ২টার বেশি অংশ থাকে (যেমন random.quickurl.io)
  if (!isLocalhost && !isVercelApp && domainParts.length > 2) {
    const subdomain = domainParts[0];
    url.pathname = `/_subdomain/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
