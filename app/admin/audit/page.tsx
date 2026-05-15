import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/withAuth';
import AuditViewer from '@/components/AuditViewer';

export default async function AdminAuditPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect('/inventory');
  }

  return (
    <main className="min-h-screen bg-[#FEF9F0] py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <AuditViewer />
      </div>
    </main>
  );
}
