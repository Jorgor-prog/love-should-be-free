// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC = ['/', '/login', '/about', '/reviews', '/api/health'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Разрешаем публичные страницы
  if (PUBLIC.some(p => pathname === p || pathname.startsWith(p))) {
    // если это именно корень — всегда редиректим на /login
    if (pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Защищенные маршруты: нужна кука
  const token = req.cookies.get('lsbf_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|uploads/).*)'
  ]
};
