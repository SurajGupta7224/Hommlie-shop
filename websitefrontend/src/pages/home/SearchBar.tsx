

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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
  }, []);

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
    
    // Save to recent searches
    const updated = [s, ...recentSearches.filter(item => item !== s)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    navigate(`/product-listing?search=${encodeURIComponent(s)}`);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const removeRecentItem = (e: React.MouseEvent, s: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(item => item !== s);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  return (
    <>
      <div className="relative group">
        <div className={`flex items-center gap-2 bg-white rounded-2xl px-3 py-2.5 border transition-all duration-300 ${focused ? 'border-primary shadow-primary/10 shadow-lg' : 'border-border shadow-sm group-hover:border-primary/50'}`}>
          <Icon name="MagnifyingGlassIcon" size={18} className={`flex-shrink-0 transition-colors ${focused ? 'text-primary' : 'text-muted-foreground'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search for groceries..."
            className="flex-1 text-sm font-semibold text-foreground placeholder:text-muted-foreground bg-transparent outline-none border-none focus:ring-0 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <Icon name="XMarkIcon" size={16} />
            </button>
          )}
        </div>

        {/* Desktop Suggestions Dropdown */}
        {focused && (
          <div 
            className="hidden md:block absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking suggestions
          >
            {/* Backdrop for desktop to close on outside click */}
            <div className="fixed inset-0 z-[-1]" onClick={() => setFocused(false)} />
            
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recent Searches</p>
                <button onClick={clearRecent} className="text-[10px] font-bold text-primary hover:underline">Clear</button>
              </div>
            )}
            
            {query.length === 0 && recentSearches.map((s) => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-foreground hover:bg-secondary transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Icon name="ClockIcon" size={14} className="text-muted-foreground" />
                  {s}
                </div>
                <Icon name="ArrowUpLeftIcon" size={14} className="text-muted-foreground/30" />
              </button>
            ))}

            {(query.length === 0 || filtered.length > 0) && (
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {query.length === 0 ? 'Popular Searches' : 'Suggestions'}
                </p>
              </div>
            )}
            
            {(query.length === 0 ? suggestions.slice(0, 5) : filtered).map((s) => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-foreground hover:bg-secondary transition-colors text-left"
              >
                <Icon name="MagnifyingGlassIcon" size={14} className="text-muted-foreground" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Full-Screen Search Overlay */}
      {focused && (
        <div className="md:hidden fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col h-full">
            {/* Search Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <button 
                onClick={() => setFocused(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-foreground"
              >
                <Icon name="ArrowLeftIcon" size={20} />
              </button>
              <div className="flex-1 flex items-center gap-2 bg-muted rounded-2xl px-4 py-2.5">
                <Icon name="MagnifyingGlassIcon" size={18} className="text-primary" />
                <input
                  ref={overlayInputRef}
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for groceries..."
                  className="flex-1 text-base font-bold text-foreground placeholder:text-muted-foreground bg-transparent outline-none border-none focus:ring-0"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-muted-foreground">
                    <Icon name="XMarkIcon" size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {/* Recent Searches */}
              {query.length === 0 && recentSearches.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recent Searches</h3>
                    <button onClick={clearRecent} className="text-[10px] font-bold text-primary">Clear all</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(s => (
                      <div 
                        key={s} 
                        onClick={() => handleSelect(s)}
                        className="flex items-center gap-2 bg-secondary text-primary px-3 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all"
                      >
                        {s}
                        <button onClick={(e) => removeRecentItem(e, s)} className="p-0.5">
                          <Icon name="XMarkIcon" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="p-4">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
                  {query.length === 0 ? 'Trending Searches' : 'Suggestions'}
                </h3>
                <div className="space-y-1">
                  {(query.length === 0 ? suggestions : filtered).map(s => (
                    <button
                      key={s}
                      onClick={() => handleSelect(s)}
                      className="w-full flex items-center justify-between py-3 border-b border-border/50 last:border-0 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name={query.length === 0 ? 'ArrowTrendingUpIcon' : 'MagnifyingGlassIcon'} size={18} className="text-muted-foreground" />
                        <span className="text-base font-bold text-foreground">{s}</span>
                      </div>
                      <Icon name="ArrowUpLeftIcon" size={16} className="text-muted-foreground/30" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
