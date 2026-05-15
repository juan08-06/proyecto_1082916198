import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/withAuth';

export default async function HomePage() {
  const user = await getCurrentUser();
  redirect(user ? '/inventory' : '/login');
}
