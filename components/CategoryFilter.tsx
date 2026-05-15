'use client';

import { CATEGORY_COLORS, CATEGORY_LABELS } from './categoryColors';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {CATEGORY_LABELS.map((category) => {
        const isActive = selectedCategory === category;
        const color = CATEGORY_COLORS[category] ?? '#6B7280';

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? 'bg-[#FDE8D5] text-[#C2410C] ring-1 ring-[#EA580C]'
                : 'bg-white text-[#78716C] border border-[#E7E5E4] hover:bg-[#FFF7ED]'
            }`}
            style={isActive ? { color } : undefined}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
