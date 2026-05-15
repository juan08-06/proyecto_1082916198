import type { User, UserRole } from './types';

export function assertRole(user: User | null, roles: UserRole[]) {
  if (!user) {
    throw new Response('No autorizado', { status: 401 });
  }

  if (!roles.includes(user.role)) {
    throw new Response('Prohibido', { status: 403 });
  }

  return user;
}
