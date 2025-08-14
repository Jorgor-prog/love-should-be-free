
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }:{params:{id:string}}) {
  const me = await getSessionUser();
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.formData();
  const file = data.get('file') as File | null;
  const id = Number(params.id);
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split('.').pop()||'png').toLowerCase();
  const filename = `u_${id}_${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(),'public','uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir,filename), bytes);
  const url = `/uploads/${filename}`;
  await prisma.profile.upsert({
    where: { userId: id },
    update: { photoUrl: url },
    create: { userId: id, photoUrl: url }
  });
  return NextResponse.json({ url });
}
