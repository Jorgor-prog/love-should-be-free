
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST() {
  try{
    const token = cookies().get('lsbf_token')?.value;
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const data:any = token ? jwt.verify(token, secret) : null;
    if (data?.id) { await prisma.user.update({ where: { id: data.id }, data: { isOnline: false }}); }
  }catch{}
  const res = NextResponse.json({ ok:true });
  clearAuthCookie(res);
  return res;
}
