'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'empleado';
  active: boolean;
  mustChangePassword?: boolean;
};

interface AdminUsersPanelProps {
  currentUserId: string;
}

export default function AdminUsersPanel({ currentUserId }: AdminUsersPanelProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [createdUserEmail, setCreatedUserEmail] = useState('');
  const [values, setValues] = useState({ name: '', email: '', role: 'empleado' });
  const router = useRouter();
  const toast = useToast();

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', { cache: 'no-store' });
      if (response.status === 401) {
        toast.pushToast('Sesión expirada. Vuelve a iniciar sesión.', 'error');
        router.push('/login');
        return;
      }
      if (response.status === 403) {
        router.push('/inventory');
        return;
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.pushToast('No se pudieron cargar los usuarios.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleActive = async (user: UserRecord) => {
    const payload = { active: !user.active };
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        toast.pushToast('Sesión expirada. Vuelve a iniciar sesión.', 'error');
        router.push('/login');
        return;
      }
      if (response.status === 403) {
        router.push('/inventory');
        return;
      }

      if (!response.ok) {
        throw new Error('No se pudo actualizar el estado del usuario.');
      }

      toast.pushToast(`Usuario ${user.active ? 'suspendido' : 'activado'} correctamente.`, 'success');
      setUsers((current) => current.map((candidate) => (candidate.id === user.id ? { ...candidate, active: !candidate.active } : candidate)));
    } catch (error) {
      toast.pushToast((error as Error).message || 'No se pudo actualizar el usuario.', 'error');
    }
  };

  const handleOpenForm = () => {
    setFormVisible(true);
    setValues({ name: '', email: '', role: 'empleado' });
    setGeneratedPassword('');
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.name.trim() || !values.email.trim()) {
      toast.pushToast('Nombre y correo son obligatorios.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name.trim(), email: values.email.trim(), role: values.role }),
      });

      if (response.status === 401) {
        toast.pushToast('Sesión expirada. Vuelve a iniciar sesión.', 'error');
        router.push('/login');
        return;
      }
      if (response.status === 403) {
        router.push('/inventory');
        return;
      }
      if (response.status === 409) {
        toast.pushToast('Ya existe un usuario con ese email.', 'error');
        return;
      }
      if (!response.ok) {
        throw new Error('No se pudo crear el usuario.');
      }

      const data = await response.json();
      setGeneratedPassword(data.temporaryPassword);
      setCreatedUserEmail(data.email);
      toast.pushToast('Usuario creado correctamente. Copia la contraseña temporal.', 'success');
      loadUsers();
    } catch (error) {
      toast.pushToast((error as Error).message || 'No se pudo crear el usuario.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#E7E5E4] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#EA580C]">Administración</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#1C1917]">Usuarios</h1>
            <p className="mt-2 text-sm text-[#78716C]">
              Crea empleados con contraseña temporal y controla quién puede acceder al inventario.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenForm}
            className="inline-flex items-center justify-center rounded-full bg-[#EA580C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C2410C]"
          >
            + Crear empleado
          </button>
        </div>
      </section>

      <section className="rounded-[32px] border border-[#E7E5E4] bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-[#1C1917]">Lista de usuarios</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-[#78716C]">Cargando usuarios…</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-[#E7E5E4] px-4 py-3 text-[#6B7280]">Nombre</th>
                  <th className="border-b border-[#E7E5E4] px-4 py-3 text-[#6B7280]">Correo</th>
                  <th className="border-b border-[#E7E5E4] px-4 py-3 text-[#6B7280]">Rol</th>
                  <th className="border-b border-[#E7E5E4] px-4 py-3 text-[#6B7280]">Estado</th>
                  <th className="border-b border-[#E7E5E4] px-4 py-3 text-[#6B7280]">Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
                    <td className="px-4 py-4">{user.name}</td>
                    <td className="px-4 py-4 text-[#52525B]">{user.email}</td>
                    <td className="px-4 py-4 uppercase tracking-[0.18em] text-[#6B7280]">{user.role}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {user.active ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        disabled={user.id === currentUserId}
                        onClick={() => handleToggleActive(user)}
                        className="min-h-[44px] rounded-full border border-[#E7E5E4] bg-white px-4 py-3 text-sm font-semibold text-[#0C2340] transition hover:border-[#EA580C] hover:text-[#EA580C] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {user.active ? 'Suspender' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {formVisible ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#EA580C]">Nuevo empleado</p>
                <h2 className="mt-3 text-3xl font-semibold text-[#1C1917]">Crear usuario</h2>
              </div>
              <button type="button" onClick={() => setFormVisible(false)} className="text-sm font-semibold text-[#6B7280] transition hover:text-[#111827]">
                Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-8 grid gap-6">
              <div className="grid gap-1 sm:grid-cols-2 sm:gap-6">
                <label className="grid gap-2 text-sm font-semibold text-[#1F2937]">
                  Nombre
                  <input
                    type="text"
                    value={values.name}
                    onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
                    className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[#1F2937]">
                  Correo electrónico
                  <input
                    type="email"
                    value={values.email}
                    onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
                    className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
                    required
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-semibold text-[#1F2937]">
                Rol
                <select
                  value={values.role}
                  onChange={(event) => setValues((prev) => ({ ...prev, role: event.target.value as 'admin' | 'empleado' }))}
                  className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
                >
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setFormVisible(false)}
                  className="rounded-full border border-[#E7E5E4] bg-white px-6 py-3 text-sm font-semibold text-[#6B7280] transition hover:border-[#EA580C] hover:text-[#111827]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#EA580C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C2410C]"
                >
                  Crear usuario
                </button>
              </div>
            </form>

            {generatedPassword ? (
              <div className="mt-8 rounded-[28px] border border-[#E7E5E4] bg-[#FEF3C7] p-5 text-sm text-[#92400E]">
                <p className="font-semibold">Contraseña temporal creada</p>
                <p className="mt-2">Usuario: {createdUserEmail}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#1C1917]">{generatedPassword}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(generatedPassword)}
                    className="rounded-full border border-[#E7E5E4] bg-white px-4 py-3 text-sm font-semibold text-[#0C2340] transition hover:border-[#EA580C] hover:text-[#EA580C]"
                  >
                    Copiar
                  </button>
                </div>
                <p className="mt-3 text-xs text-[#52525B]">Esta contraseña se muestra una única vez. Copia y entrega al empleado.</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
