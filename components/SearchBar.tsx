'use client';

import { useEffect, useState } from 'react';

interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
}

export default function SearchBar({ value, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearch(query.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <label className="relative block w-full sm:max-w-md">
      <span className="sr-only">Buscar producto</span>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar producto"
        className="w-full rounded-[24px] border border-[#E7E5E4] bg-white px-5 py-3 text-sm text-[#1C1917] outline-none transition focus:border-[#EA580C] focus:ring-2 focus:ring-[#FDE8D5]"
      />
    </label>
  );
}
