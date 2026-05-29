'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Product } from '@/lib/types';
import { CATEGORY_LABELS } from './categoryColors';

const PRODUCT_UNITS = ['kg', 'g', 'L', 'ml', 'unidad', 'caja', 'bolsa'] as const;

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => Promise<void>;
}

interface FieldErrors {
  name?: string;
  category?: string;
  unit?: string;
  quantity?: string;
  minStock?: string;
}

export default function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState(product?.category ?? 'Carnes');
  const [unit, setUnit] = useState(product?.unit ?? 'kg');
  const [quantity, setQuantity] = useState(product?.quantity.toString() ?? '0');
  const [minStock, setMinStock] = useState(product?.minStock.toString() ?? '0');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(product?.name ?? '');
    setCategory(product?.category ?? 'Carnes');
    setUnit(product?.unit ?? 'kg');
    setQuantity(product?.quantity.toString() ?? '0');
    setMinStock(product?.minStock.toString() ?? '0');
    setErrors({});
    setSubmitError('');
  }, [product]);

  const validate = () => {
    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = 'Este campo es obligatorio';
    if (!category.trim()) nextErrors.category = 'Este campo es obligatorio';
    if (!unit.trim()) nextErrors.unit = 'Este campo es obligatorio';

    const parsedQuantity = Number(quantity);
    if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
      nextErrors.quantity = 'La cantidad no puede ser negativa';
    }

    const parsedMinStock = Number(minStock);
    if (Number.isNaN(parsedMinStock) || parsedMinStock < 0) {
      nextErrors.minStock = 'El stock mínimo no puede ser negativo';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitError('');
    setIsSaving(true);

    try {
      await onSave({
        name: name.trim(),
        category: category.trim(),
        unit: unit.trim(),
        quantity: Number(quantity),
        minStock: Number(minStock),
      });
    } catch (error) {
      setSubmitError((error as Error).message || 'Error al guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#EA580C]">{product ? 'Editar producto' : 'Nuevo producto'}</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#1C1917]">{product ? 'Actualizar información' : 'Agregar producto'}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-[#6B7280] transition hover:text-[#111827]">
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
          <div className="grid gap-1">
            <label className="text-sm font-semibold text-[#1F2937]">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
            />
            {errors.name ? <p className="text-xs text-[#B91C1C]">{errors.name}</p> : null}
          </div>

          <div className="grid gap-1 sm:grid-cols-2 sm:gap-6">
            <div className="grid gap-1">
              <label className="text-sm font-semibold text-[#1F2937]">Categoría</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
              >
                {CATEGORY_LABELS.filter((entry) => entry !== 'Todas').map((entry) => (
                  <option key={entry} value={entry}>{entry}</option>
                ))}
              </select>
              {errors.category ? <p className="text-xs text-[#B91C1C]">{errors.category}</p> : null}
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-semibold text-[#1F2937]">Unidad</label>
              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
              >
                {PRODUCT_UNITS.map((entry) => (
                  <option key={entry} value={entry}>{entry}</option>
                ))}
              </select>
              {errors.unit ? <p className="text-xs text-[#B91C1C]">{errors.unit}</p> : null}
            </div>
          </div>

          <div className="grid gap-1 sm:grid-cols-2 sm:gap-6">
            <div className="grid gap-1">
              <label className="text-sm font-semibold text-[#1F2937]">Cantidad</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
              />
              {errors.quantity ? <p className="text-xs text-[#B91C1C]">{errors.quantity}</p> : null}
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-semibold text-[#1F2937]">Stock mínimo</label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={(event) => setMinStock(event.target.value)}
                className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
              />
              {errors.minStock ? <p className="text-xs text-[#B91C1C]">{errors.minStock}</p> : null}
            </div>
          </div>

          {submitError ? <div className="rounded-3xl bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">{submitError}</div> : null}

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
              {isSaving ? 'Guardando...' : product ? 'Actualizar' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
