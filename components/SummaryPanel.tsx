'use client';

interface SummaryPanelProps {
  totalProducts: number;
  alertCount: number;
  categoryCount: number;
}

export default function SummaryPanel({ totalProducts, alertCount, categoryCount }: SummaryPanelProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-[28px] border border-[#E7E5E4] bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-[#78716C]">Total Productos</p>
        <p className="mt-4 text-4xl font-semibold text-[#1C1917]">{totalProducts}</p>
      </div>
      <div className="rounded-[28px] border border-[#E7E5E4] bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-[#78716C]">Alertas Activas</p>
        <p className={`mt-4 text-4xl font-semibold ${alertCount > 0 ? 'text-[#C2410C]' : 'text-[#16A34A]'}`}>
          {alertCount}
        </p>
      </div>
      <div className="rounded-[28px] border border-[#E7E5E4] bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-[#78716C]">Categorías</p>
        <p className="mt-4 text-4xl font-semibold text-[#1C1917]">{categoryCount}</p>
      </div>
    </section>
  );
}
