

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import ProductGrid from './ProductGrid';
import FilterChips from './FilterChips';
import SortDropdown from './SortDropdown';

const categories = [
  { name: 'All', emoji: '🛒' },
  { name: 'Fruits', emoji: '🍎' },
  { name: 'Vegetables', emoji: '🥦' },
  { name: 'Dairy', emoji: '🥛' },
  { name: 'Snacks', emoji: '🍿' },
  { name: 'Beverages', emoji: '🧃' },
  { name: 'Bakery', emoji: '🍞' },
];

export default function ProductListingClient() {
  const { getTotalItems } = useCart();
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');

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
      <div className="noise-overlay" />
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-border transition-colors flex-shrink-0">
              <Icon name="ArrowLeftIcon" size={18} className="text-foreground" />
            </Link>
            <div className="flex-1">
              <h1 className="text-base font-bold text-foreground">All Products</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Fresh groceries near you</p>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
                <Icon name="HomeIcon" size={16} className="text-muted-foreground" />
                Home
              </Link>
              <Link to="/product-listing" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-primary bg-secondary transition-colors">
                <Icon name="Squares2X2Icon" size={16} className="text-primary" variant="solid" />
                Categories
              </Link>
              <Link to="/cart" className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
                <Icon name="ShoppingCartIcon" size={16} className="text-muted-foreground" />
                Cart
                {getTotalItems() > 0 && (
                  <span className="absolute -top-0.5 right-0.5 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {getTotalItems() > 9 ? '9+' : getTotalItems()}
                  </span>
                )}
              </Link>
            </nav>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <AppLogo size={24} />
              <span className="font-bold text-sm text-foreground hidden sm:block">GrocerZap</span>
            </div>
          </div>
        </div>

        {/* Mobile Filters Row */}
        <div className="md:hidden max-w-7xl mx-auto px-4 pb-3 flex items-center gap-2">
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <FilterChips active={activeFilter} onSelect={setActiveFilter} />
          </div>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6">
        <div className="md:flex md:gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              {/* Sort */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card mb-4">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">Sort By</p>
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
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">Categories</p>
                </div>
                {categories?.map((cat) => (
                  <button
                    key={cat?.name}
                    onClick={() => setActiveFilter(cat?.name)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors border-b border-border/50 last:border-0 ${activeFilter === cat?.name ? 'text-primary bg-secondary' : 'text-foreground hover:bg-muted'}`}
                  >
                    <span className="text-base">{cat?.emoji}</span>
                    {cat?.name}
                    {activeFilter === cat?.name && <Icon name="CheckIcon" size={14} className="text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Desktop sort + filter bar */}
            <div className="hidden md:flex items-center justify-between mb-4">
              <div className="overflow-x-auto no-scrollbar">
                <FilterChips active={activeFilter} onSelect={setActiveFilter} />
              </div>
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>

            <div className="reveal active">
              <ProductGrid filter={activeFilter} sort={sortBy} />
            </div>
          </div>
        </div>
      </main>
      {/* Floating Cart — mobile only */}
      {getTotalItems() > 0 && (
        <Link to="/cart" className="md:hidden">
          <div className="fixed bottom-20 right-4 z-30 flex items-center gap-2 bg-primary text-white rounded-full px-4 py-3 shadow-primary cart-pulse cursor-pointer hover:bg-primary/90 transition-all active:scale-95">
            <Icon name="ShoppingCartIcon" size={18} className="text-white" />
            <span className="text-sm font-bold">{getTotalItems()} items</span>
          </div>
        </Link>
      )}
      {/* Desktop floating cart */}
      {getTotalItems() > 0 && (
        <Link to="/cart" className="hidden md:block">
          <div className="fixed bottom-8 right-8 z-30 flex items-center gap-2 bg-primary text-white rounded-full px-5 py-3.5 shadow-primary cart-pulse cursor-pointer hover:bg-primary/90 transition-all active:scale-95">
            <Icon name="ShoppingCartIcon" size={20} className="text-white" />
            <span className="text-sm font-bold">{getTotalItems()} items</span>
          </div>
        </Link>
      )}
      <div className="md:hidden">
        <BottomNav active="categories" />
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
