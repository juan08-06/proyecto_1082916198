'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Product } from '@/lib/types';

interface RestockModalProps {
  product: Product;
  onClose: () => void;
  onSave: (amount: number) => Promise<void>;
}

export default function RestockModal({ product, onClose, onSave }: RestockModalProps) {
  const [amount, setAmount] = useState('1');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);

    if (!amount.trim()) {
      setError('Este campo es obligatorio');
      return;
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('La cantidad debe ser mayor a cero');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      await onSave(parsedAmount);
    } catch (saveError) {
      setError((saveError as Error).message || 'Error al registrar la entrada.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-[32px] bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#EA580C]">Registrar entrada</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#1C1917]">{product.name}</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Cantidad actual: {product.quantity} {product.unit}</p>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-[#6B7280] transition hover:text-[#111827]">
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
          <div className="grid gap-1">
            <label className="text-sm font-semibold text-[#1F2937]">Cantidad a agregar</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
            />
            {error ? <p className="text-xs text-[#B91C1C]">{error}</p> : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#E7E5E4] bg-white px-6 py-3 text-sm font-semibold text-[#6B7280] transition hover:border-[#EA580C] hover:text-[#111827]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-[#EA580C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#C2410C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Registrando...' : 'Guardar entrada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
