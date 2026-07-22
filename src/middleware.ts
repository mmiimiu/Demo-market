import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userRole = request.cookies.get('user_role')?.value || request.headers.get('x-user-role') || 'tenant';

  // 1. Credit System Guard: Block Tenant from accessing credit pages
  if ((pathname.includes('/credits') || pathname.includes('/profile/credits')) && userRole === 'tenant') {
    const url = request.nextUrl.clone();
    url.pathname = '/listings';
    url.searchParams.set('error', 'access_denied_credits');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/agent/:path*',
    '/owner/:path*',
    '/profile/credits/:path*',
    '/credits/:path*',
  ],
};
