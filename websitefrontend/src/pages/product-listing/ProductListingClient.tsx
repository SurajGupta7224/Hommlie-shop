

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '@/components/ui/AppIcon';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ProductGrid from './ProductGrid';
import SortDropdown from './SortDropdown';

const categories = [
  { name: 'All', emoji: '🛒', subcategories: [] },
  { name: 'Fruits', emoji: '🍎', subcategories: ['Seasonal', 'Exotic', 'Local'] },
  { name: 'Vegetables', emoji: '🥦', subcategories: ['Leafy Greens', 'Roots', 'Organic'] },
  { name: 'Dairy', emoji: '🥛', subcategories: ['Milk', 'Butter', 'Paneer'] },
  { name: 'Snacks', emoji: '🍿', subcategories: ['Chips', 'Biscuits', 'Namkeen'] },
  { name: 'Beverages', emoji: '🧃', subcategories: ['Juices', 'Tea', 'Coffee'] },
  { name: 'Bakery', emoji: '🍞', subcategories: ['Breads', 'Cakes', 'Cookies'] },
];

const subcategoryDetails: Record<string, { name: string; emoji: string }[]> = {
  'Fruits': [
    { name: 'Seasonal', emoji: '🥭' },
    { name: 'Exotic', emoji: '🥝' },
    { name: 'Local', emoji: '🍌' },
  ],
  'Vegetables': [
    { name: 'Leafy Greens', emoji: '🥬' },
    { name: 'Roots', emoji: '🥕' },
    { name: 'Organic', emoji: '🥦' },
  ],
  'Dairy': [
    { name: 'Milk', emoji: '🥛' },
    { name: 'Butter', emoji: '🧈' },
    { name: 'Paneer', emoji: '🧀' },
  ],
  'Snacks': [
    { name: 'Chips', emoji: '🍟' },
    { name: 'Biscuits', emoji: '🍪' },
    { name: 'Namkeen', emoji: '🥨' },
  ],
  'Beverages': [
    { name: 'Juices', emoji: '🧃' },
    { name: 'Tea', emoji: '🍵' },
    { name: 'Coffee', emoji: '☕' },
  ],
  'Bakery': [
    { name: 'Breads', emoji: '🍞' },
    { name: 'Cakes', emoji: '🍰' },
    { name: 'Cookies', emoji: '🍪' },
  ],
};

export default function ProductListingClient() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  const subcategoryParam = searchParams.get('subcategory') || 'All';

  const [activeFilter, setActiveFilter] = useState(categoryParam);
  const [activeSubFilter, setActiveSubFilter] = useState(subcategoryParam);
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    setActiveFilter(categoryParam);
    setActiveSubFilter(subcategoryParam);
  }, [categoryParam, subcategoryParam]);

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('active'); }),
      { threshold: 0.1 }
    );
    revealEls?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header title="All Products" showBack={true} />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6">
        <div className="md:flex md:gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              {/* Sort */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card mb-4">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Sort By</p>
                </div>
                {[
                  { value: 'popularity', label: 'Popularity' },
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Top Rated' },
                ]?.map((opt) => (
                  <button
                    key={opt?.value}
                    onClick={() => setSortBy(opt?.value)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors border-b border-border/50 last:border-0 ${sortBy === opt?.value ? 'text-primary bg-secondary' : 'text-foreground hover:bg-muted'}`}
                  >
                    {opt?.label}
                    {sortBy === opt?.value && <Icon name="CheckIcon" size={14} className="text-primary" />}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Categories</p>
                </div>
                {categories?.map((cat) => (
                  <div key={cat?.name}>
                    <button
                      onClick={() => {
                        setActiveFilter(cat?.name);
                        setActiveSubFilter('All');
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors border-b border-border/50 last:border-0 ${activeFilter === cat?.name ? 'text-primary bg-secondary/50' : 'text-foreground hover:bg-muted'}`}
                    >
                      <span className="text-base">{cat?.emoji}</span>
                      {cat?.name}
                      {activeFilter === cat?.name && <Icon name="CheckIcon" size={14} className="text-primary ml-auto" />}
                    </button>
                    
                    {/* Subcategories */}
                    {activeFilter === cat?.name && cat.subcategories.length > 0 && (
                      <div className="bg-muted/30 py-1 border-b border-border/50">
                        <button
                          onClick={() => setActiveSubFilter('All')}
                          className={`w-full text-left px-11 py-1.5 text-xs font-semibold transition-colors ${activeSubFilter === 'All' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          Show All {cat.name}
                        </button>
                        {cat.subcategories.map(sub => (
                          <button
                            key={sub}
                            onClick={() => setActiveSubFilter(sub)}
                            className={`w-full text-left px-11 py-1.5 text-xs font-semibold transition-colors ${activeSubFilter === sub ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Desktop sort + filter bar */}
            <div className="hidden md:flex items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground">{activeFilter === 'All' ? 'All Products' : activeFilter}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Showing {activeSubFilter === 'All' ? 'everything' : activeSubFilter} in {activeFilter}</p>
              </div>
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>

            {/* Subcategory Cards Grid */}
            {activeFilter !== 'All' && subcategoryDetails[activeFilter] && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-12 reveal active">
                <button
                  onClick={() => setActiveSubFilter('All')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${activeSubFilter === 'All' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-border hover:border-primary/50'}`}
                >
                  <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-xl mb-2">✨</div>
                  <span className={`text-[10px] font-semibold text-center ${activeSubFilter === 'All' ? 'text-primary' : 'text-foreground'}`}>Show All</span>
                </button>
                {subcategoryDetails[activeFilter].map((sub) => (
                  <button
                    key={sub.name}
                    onClick={() => setActiveSubFilter(sub.name)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${activeSubFilter === sub.name ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-border hover:border-primary/50'}`}
                  >
                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-xl mb-2 transition-transform group-hover:scale-110">
                      {sub.emoji}
                    </div>
                    <span className={`text-[10px] font-semibold text-center leading-tight ${activeSubFilter === sub.name ? 'text-primary' : 'text-foreground'}`}>
                      {sub.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="reveal active">
              <ProductGrid filter={activeFilter} subFilter={activeSubFilter} sort={sortBy} />
            </div>
          </div>
        </div>
      </main>
      {/* Floating Cart bar is now handled globally in App.tsx */}
      <div className="md:hidden">
        <BottomNav active="categories" />
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
