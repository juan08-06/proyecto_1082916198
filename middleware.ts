import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import { getJwtSecret } from './lib/env';

const jwtSecret = getJwtSecret();
const secret = jwtSecret ? new TextEncoder().encode(jwtSecret) : null;

export async function middleware(request: Request) {
  const url = new URL(request.url);
  const token = request.headers.get('cookie')?.split(';').find((cookie) => cookie.trim().startsWith('token='));
  const tokenValue = token?.split('=')[1];

  if (!secret || !tokenValue) {
    url.pathname = '/inventory';
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(tokenValue, secret, { algorithms: ['HS256'] });
    if (payload.role !== 'admin') {
      url.pathname = '/inventory';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    url.pathname = '/inventory';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
