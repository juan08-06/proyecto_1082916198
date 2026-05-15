import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from './auth';
import type { User } from './types';

function parseTokenFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return null;

  const cookiesArray = cookieHeader.split(';').map((cookie) => cookie.trim());
  const tokenCookie = cookiesArray.find((cookie) => cookie.startsWith('token='));
  return tokenCookie?.slice('token='.length) ?? null;
}

export async function getCurrentUser(request?: Request): Promise<User | null> {
  const token = request
    ? parseTokenFromCookieHeader(request.headers.get('cookie'))
    : cookies().get('token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyJwt(token);
  if (!payload) {
    return null;
  }

  if (!payload.sub || !payload.email || !payload.role || !payload.name) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    name: payload.name,
    passwordHash: '',
    active: true,
  };
}

export async function requireAuth(request?: Request): Promise<User> {
  const user = await getCurrentUser(request);
  if (!user) {
    redirect('/login');
  }
  return user;
}
