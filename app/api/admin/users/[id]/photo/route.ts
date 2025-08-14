export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request, { params }:{ params:{ id:string } }) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(params.id);

  const data = await req.formData();
  const file = data.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (file.size > 5*1024*1024) return NextResponse.json({ error: 'File too large' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
  const filename = `u_${id}_${Date.now()}.${ext}`;
  const filePath = path.join(uploadDir, filename);

  await writeFile(filePath, buffer);

  const url = `/uploads/${filename}`;
  await prisma.profile.upsert({
    where: { userId: id },
    update: { photoUrl: url },
    create: { userId: id, photoUrl: url }
  });

  return NextResponse.json({ ok: true, photoUrl: url });
}
