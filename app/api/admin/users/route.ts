
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSessionUser } from '@/lib/auth';

function genId(){ return Math.floor(10000000 + Math.random()*90000000).toString(); }
function genPass(len=8){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({length:len},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
}

export async function GET() {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const users = await prisma.user.findMany({ where: { role: 'USER' }, include: { profile:true, codeConfig:true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const loginId = genId();
  const plain = genPass(8);
  const passwordHash = await bcrypt.hash(plain, 10);
  const user = await prisma.user.create({ data: {
    role: 'USER', loginId, passwordHash, adminNoteName: body?.adminNoteName || null,
    profile: { create: {} },
    codeConfig: { create: { code: '', emitIntervalSec: 22 } }
  }});
  return NextResponse.json({ user: { id: user.id, loginId, password: plain } });
}
