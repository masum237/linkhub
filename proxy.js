import { NextResponse, userAgent } from 'next/server';

export function proxy(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  const { device } = userAgent(req);
  const isMobile = device.type === 'mobile' || device.type === 'tablet';
  url.searchParams.set('isMobile', isMobile ? 'true' : 'false');

  const currentHost = hostname.split(':')[0];
  const isVercelApp = currentHost.endsWith('.vercel.app');
  const isLocalhost = currentHost.includes('localhost');
  const domainParts = currentHost.split('.');

  if (!isLocalhost && !isVercelApp && domainParts.length > 2) {
    const subdomain = domainParts[0];
    url.pathname = `/_subdomain/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
