

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const sortOptions = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = sortOptions.find((o) => o.value === value);

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-white border border-border rounded-full px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary transition-colors"
      >
        <Icon name="AdjustmentsHorizontalIcon" size={13} className="text-muted-foreground" />
        <span>{current?.label || 'Sort'}</span>
        <Icon name="ChevronDownIcon" size={12} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-48 bg-white rounded-2xl shadow-card-hover border border-border z-50 overflow-hidden">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary ${opt.value === value ? 'text-primary bg-secondary' : 'text-foreground'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
