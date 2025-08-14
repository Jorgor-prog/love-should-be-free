
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const PROTECTED = ['/admin','/dashboard','/confirm','/chat','/about','/reviews'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();
  const token = req.cookies.get('lsbf_token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  try {
    const data:any = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    if (pathname.startsWith('/admin') && data.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = { matcher: ['/admin/:path*','/dashboard/:path*','/confirm/:path*','/chat/:path*','/about','/reviews'] };
