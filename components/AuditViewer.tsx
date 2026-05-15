'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastProvider';

interface AuditEntry {
  id: string;
  createdAt: string;
  userId: string;
  userName: string;
  userRole: string;
  event: string;
  detail: string;
}

const formatMonth = (date: Date) => date.toISOString().slice(0, 7);

export default function AuditViewer() {
  const [month, setMonth] = useState(formatMonth(new Date()));
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  const months = useMemo(() => {
    const result: string[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i += 1) {
      const candidate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push(formatMonth(candidate));
    }
    return result;
  }, []);

  const loadAudit = useCallback(async (selectedMonth: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/audit?month=${selectedMonth}`, { cache: 'no-store' });
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
        throw new Error('No se pudieron cargar los registros de auditoría.');
      }
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      toast.pushToast((error as Error).message || 'Error al cargar auditoría.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadAudit(month);
  }, [loadAudit, month]);

  return (
    <div className="rounded-[32px] border border-[#E7E5E4] bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#EA580C]">Auditoría</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1C1917]">Registros</h1>
        </div>
        <label className="grid gap-2 text-sm text-[#1F2937]"><span>Mes</span>
          <select
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="rounded-3xl border border-[#E7E5E4] bg-[#FAFAFA] px-4 py-3 text-sm outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
          >
            {months.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-[#78716C]">Cargando registros…</p>
      ) : entries.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-[#E7E5E4] bg-[#FEF7ED] p-6 text-sm text-[#78716C]">
          No se encontraron registros para {month}.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {entries.map((entry) => (
            <article key={entry.id} className="rounded-[28px] border border-[#E7E5E4] bg-[#FAFAFA] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-4">
                <p className="text-sm font-semibold text-[#1C1917]">{entry.event}</p>
                <p className="text-xs uppercase tracking-[0.28em] text-[#78716C]">{new Date(entry.createdAt).toLocaleString('es-CO')}</p>
              </div>
              <p className="mt-2 text-sm text-[#52525B]">{entry.detail}</p>
              <p className="mt-2 text-xs text-[#6B7280]">{entry.userName} • {entry.userRole}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
