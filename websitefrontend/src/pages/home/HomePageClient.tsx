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
import HowItWorks from './HowItWorks';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';

export default function HomePageClient() {
  const [location, setLocation] = useState('Koramangala, Bengaluru');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { getTotalItems, addItem, getItemQty } = useCart();
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
      {/* Sticky Header */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/95 backdrop-blur-md shadow-sm'}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 md:py-3">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-primary/20">
                  <AppLogo size={24} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-foreground uppercase tracking-wider leading-none">Delivering to</span>
                    <Icon name="BoltIcon" size={10} className="text-success" variant="solid" />
                  </div>
                  <button 
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    className="flex items-center gap-0.5 text-sm font-black text-primary transition-all active:opacity-70"
                  >
                    <span className="max-w-[150px] truncate">{location?.split(',')?.[0]}</span>
                    <Icon name="ChevronDownIcon" size={12} className="text-primary mt-0.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/cart" className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center transition-all active:scale-90">
                  <Icon name="ShoppingCartIcon" size={20} className="text-primary" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center transition-all active:scale-90"
                >
                  <Icon name="UserIcon" size={20} className="text-foreground" />
                </button>
              </div>
            </div>
            
            {/* Mobile Search Bar */}
            <div className="relative">
              <SearchBar />
            </div>

            {/* Mobile Location Overlay */}
            {showLocationDropdown && (
              <div className="md:hidden fixed inset-0 z-[100] flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <button 
                    onClick={() => setShowLocationDropdown(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-foreground"
                  >
                    <Icon name="ArrowLeftIcon" size={20} />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-base font-black text-foreground">Delivery Location</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select your area</p>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Icon name="MagnifyingGlassIcon" size={16} className="text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search for area, street name..."
                      className="w-full bg-muted border-none rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="MapPinIcon" size={14} className="text-primary" variant="solid" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Saved Addresses</span>
                    </div>
                    {locations?.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => { setLocation(loc); setShowLocationDropdown(false); }}
                        className={`w-full text-left p-4 rounded-2xl flex items-start gap-3 transition-all border ${loc === location ? 'bg-secondary border-primary/20 shadow-sm' : 'bg-white border-transparent hover:bg-muted'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${loc === location ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                          <Icon name="HomeIcon" size={16} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-black ${loc === location ? 'text-primary' : 'text-foreground'}`}>{loc?.split(',')?.[0]}</p>
                          <p className="text-xs text-muted-foreground font-medium truncate">{loc}</p>
                        </div>
                        {loc === location && <Icon name="CheckCircleIcon" size={18} className="text-primary" variant="solid" />}
                      </button>
                    ))}
                  </div>

                  <button className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-border text-primary font-black text-sm hover:bg-secondary/50 transition-colors">
                    <Icon name="PlusIcon" size={18} variant="solid" />
                    Add New Address
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Header (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <AppLogo size={28} />
              <span className="font-bold text-lg text-foreground tracking-tight">Hommlie Shop</span>
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
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                <Icon name="UserIcon" size={16} className="text-muted-foreground" />
                Profile
              </button>
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
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-[116px] md:pt-[76px]">
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
                  <Link key={cat?.name} to={`/product-listing?category=${cat?.name}`}>
                    <div className={`${cat?.color} ${cat?.border} border rounded-2xl flex flex-col items-center justify-center py-3 px-1 gap-1.5 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95`}>
                      <span className="text-2xl">{cat?.emoji}</span>
                      <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{cat?.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Now Section */}
            <div className="reveal active mb-8 px-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight">Trending Now</h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1">What others are ordering</p>
                </div>
                <Link to="/product-listing" className="group flex items-center gap-1.5 text-sm font-black text-primary transition-all">
                  See all
                  <Icon name="ArrowRightIcon" size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {[
                  { id: 't1', name: 'Fresh Avocado', weight: '500g', price: 199, oldPrice: 249, image: '🥑', color: 'bg-green-50', realImg: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80' },
                  { id: 't2', name: 'Red Cherries', weight: '250g', price: 349, oldPrice: 399, image: '🍒', color: 'bg-red-50', realImg: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800&q=80' },
                  { id: 't3', name: 'Organic Honey', weight: '200g', price: 149, oldPrice: 179, image: '🍯', color: 'bg-amber-50', realImg: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80' },
                  { id: 't4', name: 'Blueberries', weight: '125g', price: 299, oldPrice: 349, image: '🫐', color: 'bg-blue-50', realImg: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&q=80' },
                  { id: 't5', name: 'Kiwi Fruit', weight: '3 pcs', price: 99, oldPrice: 129, image: '🥝', color: 'bg-emerald-50', realImg: 'https://images.unsplash.com/photo-1585059895324-582b3c8f2584?w=800&q=80' },
                ].map((item) => {
                  const qty = getItemQty(item.id);
                  return (
                    <div key={item.id} className="flex-shrink-0 w-44 bg-white rounded-3xl border border-border/50 p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                      <div className={`${item.color} rounded-2xl h-32 flex items-center justify-center text-5xl mb-3 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {item.image}
                        <button 
                          onClick={() => addItem({ id: item.id, name: item.name, price: item.price, image: item.realImg, weight: item.weight })}
                          className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center text-primary transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all active:scale-90"
                        >
                          <Icon name="PlusIcon" size={18} variant="solid" />
                        </button>
                        {qty > 0 && (
                          <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                            {qty}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 px-1">
                        <Link to={`/product/${item.id}`}>
                          <h3 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{item.name}</h3>
                        </Link>
                        <p className="text-[10px] font-bold text-muted-foreground">{item.weight}</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-foreground">₹{item.price}</span>
                            <span className="text-[10px] font-bold text-muted-foreground line-through opacity-50">₹{item.oldPrice}</span>
                          </div>
                          <div className="bg-success/10 text-success text-[10px] font-black px-2 py-0.5 rounded-full">
                            {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
      <HowItWorks />
      
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

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
