
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(_:Request, { params }:{params:{id:string}}) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(params.id);
  const user = await prisma.user.findUnique({ where: { id }, include: { profile:true, codeConfig:true } });
  return NextResponse.json({ user });
}

export async function PUT(req:Request, { params }:{params:{id:string}}) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(params.id);
  const body = await req.json();
  const data:any = {};
  if (body.adminNoteName !== undefined) data.adminNoteName = body.adminNoteName;
  if (body.emitIntervalSec !== undefined) {
    await prisma.codeConfig.update({ where: { userId: id }, data: { emitIntervalSec: Math.max(1, Number(body.emitIntervalSec)||22) } });
  }
  if (Object.keys(data).length) await prisma.user.update({ where: { id }, data });
  if (body.profile) {
    await prisma.profile.upsert({
      where: { userId: id },
      update: body.profile,
      create: { userId: id, ...body.profile }
    });
  }
  if (body.code !== undefined) {
    await prisma.codeConfig.update({ where: { userId: id }, data: { code: body.code } });
  }
  const user = await prisma.user.findUnique({ where: { id }, include: { profile:true, codeConfig:true } });
  return NextResponse.json({ user });
}
