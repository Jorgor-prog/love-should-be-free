
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({});
  let admin = null;
  if (user.role === 'USER') {
    admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true, loginId: true } });
  }
  return NextResponse.json({ user, admin });
}
