import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import BottomNav from '@/components/BottomNav';
import { useCart } from '@/context/CartContext';
import SearchBar from './SearchBar';
import BannerSlider from './BannerSlider';
import CategoriesGrid from './CategoriesGrid';
import BestSellers from './BestSellers';
import DealsSection from './DealsSection';
import Footer from '@/components/Footer';

export default function HomePageClient() {
  const [location, setLocation] = useState('Koramangala, Bengaluru');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const { getTotalItems } = useCart();
  const headerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const locations = [
    'Koramangala, Bengaluru',
    'Indiranagar, Bengaluru',
    'HSR Layout, Bengaluru',
    'Whitefield, Bengaluru',
    'Bandra, Mumbai',
    'Andheri, Mumbai',
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('active'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls?.forEach((el) => observer?.observe(el));
    return () => observer?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <div className="noise-overlay" />
      {/* Sticky Header */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/95 backdrop-blur-md shadow-sm'}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          {/* Desktop Header */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <AppLogo size={28} />
              <span className="font-bold text-lg text-foreground tracking-tight">GrocerZap</span>
            </div>

            {/* Location Selector */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center gap-1 text-xs font-semibold text-primary bg-secondary rounded-full px-3 py-1.5 transition-all hover:bg-primary/10"
              >
                <Icon name="MapPinIcon" size={13} className="text-primary" variant="solid" />
                <span className="max-w-[130px] truncate">{location}</span>
                <Icon name="ChevronDownIcon" size={12} className="text-primary" />
              </button>

              {showLocationDropdown && (
                <div className="absolute left-0 top-9 w-56 bg-white rounded-2xl shadow-card-hover border border-border z-50 overflow-hidden">
                  <div className="px-4 pt-3 pb-2 border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Select Location</p>
                  </div>
                  {locations?.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocation(loc); setShowLocationDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary ${loc === location ? 'text-primary bg-secondary' : 'text-foreground'}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Bar — expands on desktop */}
            <div className="flex-1 max-w-xl">
              <SearchBar />
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
              <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-primary bg-secondary transition-colors">
                <Icon name="HomeIcon" size={16} className="text-primary" variant="solid" />
                Home
              </Link>
              <Link to="/product-listing" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
                <Icon name="Squares2X2Icon" size={16} className="text-muted-foreground" />
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
              <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
                <Icon name="UserIcon" size={16} className="text-muted-foreground" />
                Profile
              </Link>
            </nav>

            {/* Delivery Badge — desktop only */}
            <div className="hidden lg:flex items-center gap-1.5 bg-success/10 text-success rounded-full px-3 py-1.5 flex-shrink-0">
              <Icon name="BoltIcon" size={13} className="text-success" variant="solid" />
              <span className="text-xs font-bold whitespace-nowrap">10 min delivery</span>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-[76px]">
        {/* Mobile Delivery Badge */}
        <div className="flex items-center gap-2 mb-4 mt-4 md:hidden reveal active">
          <div className="flex items-center gap-1.5 bg-success/10 text-success rounded-full px-3 py-1 badge-bounce">
            <Icon name="BoltIcon" size={13} className="text-success" variant="solid" />
            <span className="text-xs font-bold">Delivery in 10 mins</span>
          </div>
          <span className="text-xs text-muted-foreground">to {location?.split(',')?.[0]}</span>
        </div>

        {/* Desktop: Two-column layout */}
        <div className="md:flex md:gap-8 md:pt-6">
          {/* Left Sidebar — Desktop only */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              {/* Delivery info card */}
              <div className="bg-success/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="BoltIcon" size={16} className="text-success" variant="solid" />
                  <span className="text-sm font-bold text-success">10 min delivery</span>
                </div>
                <p className="text-xs text-muted-foreground">to {location?.split(',')?.[0]}</p>
              </div>

              {/* Category Quick Links */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide">Categories</p>
                </div>
                {[
                  { name: 'Fruits', emoji: '🍎' },
                  { name: 'Vegetables', emoji: '🥦' },
                  { name: 'Dairy', emoji: '🥛' },
                  { name: 'Snacks', emoji: '🍿' },
                  { name: 'Beverages', emoji: '🧃' },
                  { name: 'Bakery', emoji: '🍞' },
                  { name: 'Meat', emoji: '🥩' },
                  { name: 'Household', emoji: '🧹' },
                ]?.map((cat) => (
                  <Link key={cat?.name} to="/product-listing">
                    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors cursor-pointer border-b border-border/50 last:border-0">
                      <span className="text-lg">{cat?.emoji}</span>
                      <span className="text-sm font-medium text-foreground">{cat?.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Banner Slider */}
            <div className="reveal reveal-delay-1 active mb-6">
              <BannerSlider />
            </div>

            {/* Categories — mobile only (sidebar handles desktop) */}
            <div className="reveal reveal-delay-2 active mb-6 md:hidden">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-foreground">Shop by Category</h2>
                <Link to="/product-listing" className="text-xs font-semibold text-primary hover:underline">See all</Link>
              </div>
              <CategoriesGrid />
            </div>

            {/* Desktop Categories Grid */}
            <div className="hidden md:block reveal reveal-delay-2 active mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-foreground">Shop by Category</h2>
                <Link to="/product-listing" className="text-sm font-semibold text-primary hover:underline">See all</Link>
              </div>
              <div className="grid grid-cols-8 gap-3">
                {[
                  { name: 'Fruits', emoji: '🍎', color: 'bg-red-50', border: 'border-red-100' },
                  { name: 'Vegetables', emoji: '🥦', color: 'bg-green-50', border: 'border-green-100' },
                  { name: 'Dairy', emoji: '🥛', color: 'bg-blue-50', border: 'border-blue-100' },
                  { name: 'Snacks', emoji: '🍿', color: 'bg-yellow-50', border: 'border-yellow-100' },
                  { name: 'Beverages', emoji: '🧃', color: 'bg-orange-50', border: 'border-orange-100' },
                  { name: 'Bakery', emoji: '🍞', color: 'bg-amber-50', border: 'border-amber-100' },
                  { name: 'Meat', emoji: '🥩', color: 'bg-rose-50', border: 'border-rose-100' },
                  { name: 'Household', emoji: '🧹', color: 'bg-purple-50', border: 'border-purple-100' },
                ]?.map((cat) => (
                  <Link key={cat?.name} to="/product-listing">
                    <div className={`${cat?.color} ${cat?.border} border rounded-2xl flex flex-col items-center justify-center py-3 px-1 gap-1.5 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95`}>
                      <span className="text-2xl">{cat?.emoji}</span>
                      <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{cat?.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Best Sellers */}
            <div className="reveal active mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base md:text-lg font-bold text-foreground">Best Sellers</h2>
                <Link to="/product-listing" className="text-xs md:text-sm font-semibold text-primary hover:underline">View all</Link>
              </div>
              <BestSellers />
            </div>

            {/* Deals of the Day */}
            <div className="reveal active mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base md:text-lg font-bold text-foreground">Deals of the Day</h2>
                <div className="flex items-center gap-1 text-xs md:text-sm font-semibold text-accent">
                  <Icon name="ClockIcon" size={13} className="text-accent" />
                  <span>Ends tonight</span>
                </div>
              </div>
              <DealsSection />
            </div>
          </div>
        </div>
      </main>
      {/* Footer — desktop only */}
      <div className="hidden md:block">
        <Footer />
      </div>
      {/* Floating Cart Button — mobile only */}
      {getTotalItems() > 0 && (
        <Link to="/cart" className="md:hidden">
          <div className="fixed bottom-20 right-4 z-30 flex items-center gap-2 bg-primary text-white rounded-full px-4 py-3 shadow-primary cart-pulse cursor-pointer hover:bg-primary/90 transition-all active:scale-95">
            <Icon name="ShoppingCartIcon" size={18} className="text-white" />
            <span className="text-sm font-bold">{getTotalItems()} items</span>
          </div>
        </Link>
      )}
      {/* Bottom Nav — mobile only */}
      <div className="md:hidden">
        <BottomNav active="home" />
      </div>
    </div>
  );
}
