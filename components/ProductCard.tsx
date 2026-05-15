'use client';

import type { Product } from '@/lib/types';
import { CATEGORY_COLORS } from './categoryColors';

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRestock: (product: Product) => void;
}

export default function ProductCard({ product, isAdmin, onEdit, onDelete, onRestock }: ProductCardProps) {
  const isLowStock = product.quantity <= product.minStock;
  const categoryColor = CATEGORY_COLORS[product.category] ?? '#6B7280';

  return (
    <article className="rounded-[28px] border border-[#E7E5E4] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]" style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}>
          {product.category}
        </span>
        {isLowStock ? (
          <span className="rounded-2xl bg-[#FFFBEB] px-3 py-1 text-xs font-semibold text-[#92400E]">
            ⚠ Stock bajo
          </span>
        ) : null}
      </div>

      <h3 className="mt-5 text-2xl font-semibold text-[#1C1917]">{product.name}</h3>
      <p className="mt-3 text-sm text-[#78716C]">Unidad: {product.unit}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-[#F8FAFC] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[#78716C]">Cantidad</p>
          <p className="mt-2 text-3xl font-semibold text-[#1C1917]">{product.quantity}</p>
        </div>
        <div className="rounded-3xl bg-[#F8FAFC] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[#78716C]">Stock mínimo</p>
          <p className="mt-2 text-3xl font-semibold text-[#1C1917]">{product.minStock}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => onRestock(product)}
          className="w-full rounded-full bg-[#FEF3C7] px-4 py-2 text-sm font-semibold text-[#92400E] transition hover:bg-[#FEEBC8] sm:w-auto"
        >
          Registrar entrada
        </button>

        {isAdmin ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="w-full rounded-full border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#0C2340] transition hover:border-[#EA580C] hover:text-[#EA580C] sm:w-auto"
            >
              ✎ Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(product)}
              className="w-full rounded-full border border-[#E7E5E4] bg-white px-3 py-2 text-sm text-[#DC2626] transition hover:bg-[#FEE2E2] sm:w-auto"
            >
              🗑 Eliminar
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
