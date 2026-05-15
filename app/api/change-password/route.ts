import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { comparePassword, hashPassword, verifyJwt } from '@/lib/auth';
import { findSeedUserByEmail, updateSeedUserPassword } from '@/lib/seedReader';

export async function POST(request: Request) {
  const token = cookies().get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  const body = await request.json();
  const currentPassword = String(body.currentPassword || '');
  const newPassword = String(body.newPassword || '');

  const user = findSeedUserByEmail(payload.email);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 401 });
  }

  const nextPasswordHash = await hashPassword(newPassword);
  updateSeedUserPassword(user.email, nextPasswordHash);

  return NextResponse.json({ status: 'ok' });
}
