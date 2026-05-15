import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { UserRole } from './types';

function getJwtKey() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET no está configurado');
  }
  return new TextEncoder().encode(jwtSecret);
}

export interface AuthTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function comparePassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createJwt(payload: AuthTokenPayload) {
  return await new SignJWT({
    email: payload.email,
    role: payload.role,
    name: payload.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getJwtKey());
}

export async function verifyJwt(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtKey(), {
      algorithms: ['HS256'],
    });

    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}
