import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, createJwt } from '@/lib/auth';
import { findSeedUserByEmail } from '@/lib/seedReader';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email || '').trim();
  const password = String(body.password || '');

  const user = findSeedUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const token = await createJwt({
    sub: user.id ?? email,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const response = NextResponse.json({ status: 'ok', role: user.role, mustChangePassword: user.mustChangePassword ?? false });
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
