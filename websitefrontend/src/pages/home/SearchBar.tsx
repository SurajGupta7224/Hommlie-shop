

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/AppIcon';

const suggestions = [
  'Amul Milk 500ml', 'Fresh Tomatoes 1kg', 'Banana Bunch', 'Lay\'s Chips',
  'Britannia Bread', 'Tropicana Orange Juice', 'Basmati Rice 5kg', 'Eggs (12 pack)',
];

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length > 1) {
      setFiltered(suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5));
    } else {
      setFiltered([]);
    }
  }, [query]);

  const handleSelect = (s: string) => {
    setQuery(s);
    setFocused(false);
    navigate('/product-listing');
  };

  return (
    <div className="relative">
      <div className={`flex items-center gap-2 bg-white rounded-2xl px-3 py-2.5 border transition-all duration-200 ${focused ? 'border-primary shadow-primary/20 shadow-md' : 'border-border shadow-sm'}`}>
        <Icon name="MagnifyingGlassIcon" size={18} className="text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search for groceries..."
          className="flex-1 text-sm font-medium text-foreground placeholder:text-muted-foreground bg-transparent outline-none border-none focus:ring-0 focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="XMarkIcon" size={16} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {focused && (filtered.length > 0 || query.length === 0) && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-card-hover border border-border z-50 overflow-hidden">
          {query.length === 0 && (
            <div className="px-3 pt-2.5 pb-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Popular Searches</p>
            </div>
          )}
          {(query.length === 0 ? suggestions.slice(0, 5) : filtered).map((s) => (
            <button
              key={s}
              onMouseDown={() => handleSelect(s)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors text-left"
            >
              <Icon name="MagnifyingGlassIcon" size={14} className="text-muted-foreground flex-shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
