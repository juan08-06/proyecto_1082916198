import type { UserRole } from '@/lib/types';

interface SidebarProps {
  role: UserRole;
}

export default function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="rounded-[32px] border border-[#E7E5E4] bg-white p-6 shadow-sm">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.32em] text-[#EA580C]">Navegación</p>
        <h2 className="mt-4 text-2xl font-semibold text-[#1C1917]">Playa Alta</h2>
        <p className="mt-2 text-sm text-[#78716C]">Gestión de inventario</p>
      </div>

      <nav className="space-y-4 text-sm text-[#1C1917]">
        <a href="/inventory" className="block rounded-3xl border border-[#E7E5E4] bg-[#FEF7ED] px-4 py-3 font-semibold text-[#0C2340] transition hover:border-[#EA580C]">Inventario</a>

        {role === 'admin' ? (
          <div className="rounded-[24px] border border-[#E7E5E4] bg-[#FFFFFF] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[#78716C]">Administración</p>
            <div className="mt-3 space-y-2">
              <a href="/admin/db-setup" className="block rounded-2xl bg-[#FEF3C7] px-4 py-3 text-sm font-semibold text-[#92400E] transition hover:bg-[#FFF7ED]">
                DB setup
              </a>
              <a href="/admin/users" className="block rounded-2xl border border-[#E7E5E4] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0C2340] transition hover:border-[#EA580C] hover:text-[#EA580C]">
                Usuarios
              </a>
              <a href="/admin/audit" className="block rounded-2xl border border-[#E7E5E4] bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#0C2340] transition hover:border-[#EA580C] hover:text-[#EA580C]">
                Auditoría
              </a>
            </div>
          </div>
        ) : null}

        <a href="/profile" className="block rounded-3xl border border-[#E7E5E4] bg-[#FEF7ED] px-4 py-3 transition hover:border-[#EA580C]">
          <p className="text-xs uppercase tracking-[0.24em] text-[#78716C]">Perfil</p>
          <p className="mt-2 text-sm text-[#1C1917]">Accede a tu información y ajustes.</p>
        </a>
      </nav>
    </aside>
  );
}
