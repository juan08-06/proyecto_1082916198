'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';

export default function ProfileForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const validate = () => {
    const nextErrors = { currentPassword: '', newPassword: '', confirmPassword: '' };
    if (!currentPassword.trim()) nextErrors.currentPassword = 'Este campo es obligatorio';
    if (!newPassword.trim()) nextErrors.newPassword = 'Este campo es obligatorio';
    if (newPassword.length < 6) nextErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(nextErrors);
    return !nextErrors.currentPassword && !nextErrors.newPassword && !nextErrors.confirmPassword;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.status === 401) {
        toast.pushToast('Sesión expirada. Vuelve a iniciar sesión.', 'error');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'No se pudo cambiar la contraseña.');
      }

      toast.pushToast('Contraseña actualizada con éxito.', 'success');
      router.push('/inventory');
    } catch (error) {
      toast.pushToast((error as Error).message || 'No se pudo cambiar la contraseña.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-[32px] border border-[#E7E5E4] bg-white p-8 shadow-sm">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.28em] text-[#EA580C]">Perfil</p>
        <h1 className="text-3xl font-semibold text-[#1C1917]">Actualizar contraseña</h1>
        <p className="text-sm leading-6 text-[#78716C]">
          Debes cambiar tu contraseña temporal antes de continuar. Usar una contraseña segura que recuerdes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
        <label className="grid gap-2 text-sm font-semibold text-[#1F2937]">
          Contraseña actual
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
          />
          {errors.currentPassword ? <p className="text-xs text-[#B91C1C]">{errors.currentPassword}</p> : null}
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#1F2937]">
          Nueva contraseña
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
          />
          {errors.newPassword ? <p className="text-xs text-[#B91C1C]">{errors.newPassword}</p> : null}
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#1F2937]">
          Confirmar nueva contraseña
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
          />
          {errors.confirmPassword ? <p className="text-xs text-[#B91C1C]">{errors.confirmPassword}</p> : null}
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-[#EA580C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C2410C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
}
