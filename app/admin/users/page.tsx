import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/withAuth';
import AdminUsersPanel from '@/components/AdminUsersPanel';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect('/inventory');
  }

  return (
    <main className="min-h-screen bg-[#FEF9F0] py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <AdminUsersPanel currentUserId={user.id} />
      </div>
    </main>
  );
}
