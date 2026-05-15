import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/withAuth';
import BootstrapPanel from '@/components/BootstrapPanel';

export default async function AdminDbSetupPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/inventory');
  }

  return (
    <main className="min-h-screen bg-[#FEF9F0] py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[32px] border border-[#E7E5E4] bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-[#EA580C]">Administración</p>
          <h1 className="mt-3 text-4xl font-semibold text-[#1C1917]">DB Setup</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#78716C]">
            Esta pantalla permite iniciar el bootstrap del sistema. Aplicará 2 migrations y cargará 1 usuario admin y 6 productos demo del restaurante.
          </p>
        </section>

        <BootstrapPanel />
      </div>
    </main>
  );
}
