export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('lsbf_token', '', { httpOnly: true, sameSite: 'lax', path: '/', secure: true, maxAge: 0 });
  return res;
}
