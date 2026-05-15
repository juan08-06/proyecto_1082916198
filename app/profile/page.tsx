import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/withAuth';
import ProfileForm from '@/components/ProfileForm';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-[#FEF9F0] py-10 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-[32px] border border-[#E7E5E4] bg-white p-8 shadow-sm">
          <ProfileForm />
        </section>
      </div>
    </main>
  );
}
