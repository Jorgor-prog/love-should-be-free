// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/admin','/dashboard','/confirm','/chat','/about','/reviews'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('lsbf_token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  // Не проверяем роль в middleware. Проверка ролей — внутри API/страниц.
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*','/dashboard/:path*','/confirm/:path*','/chat/:path*','/about','/reviews']
};
