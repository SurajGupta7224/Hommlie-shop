
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import SearchBar from '@/pages/home/SearchBar';
import LoginModal from '@/components/LoginModal';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function Header({ title, showBack = false }: HeaderProps) {
  const [location, setLocation] = useState('Koramangala, Bengaluru');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const { isLoggedIn, user, logout, isLoginModalOpen, setIsLoginModalOpen } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const locations = [
    'Koramangala, Bengaluru',
    'Indiranagar, Bengaluru',
    'HSR Layout, Bengaluru',
    'Whitefield, Bengaluru',
    'Bandra, Mumbai',
    'Andheri, Mumbai',
  ];

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-blue-50`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 md:py-3">
          {/* Main Top Navbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Logo (Desktop) / Branding */}
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-primary/20 flex-shrink-0">
                  <AppLogo size={24} />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xl font-semibold text-primary tracking-tight leading-none">Hommlie Shop</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">10 Min Delivery</span>
                </div>
              </Link>

              {/* Location Selector (Desktop/Mobile) */}
              <div className="flex flex-col ml-2 md:ml-4">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider leading-none">Delivering to</span>
                  <Icon name="BoltIcon" size={10} className="text-success" variant="solid" />
                </div>
                <button 
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="flex items-center gap-0.5 text-sm font-semibold text-primary transition-all active:opacity-70"
                >
                  <span className="max-w-[120px] md:max-w-[200px] truncate">{location?.split(',')?.[0]}</span>
                  <Icon name="ChevronDownIcon" size={12} className="text-primary mt-0.5" />
                </button>
              </div>

              {/* Search Bar (Desktop Only) */}
              <div className="hidden lg:block flex-1 max-w-xl ml-8">
                <SearchBar />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 md:gap-4">
              <Link to="/cart" className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center transition-all active:scale-90">
                <Icon name="ShoppingCartIcon" size={20} className="text-primary" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground max-w-[100px] truncate">{user?.name || user?.mobile}</span>
                  <button 
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center transition-all active:scale-90 hover:bg-red-50"
                    title="Logout"
                  >
                    <Icon name="ArrowRightOnRectangleIcon" size={20} className="text-foreground" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center transition-all active:scale-90"
                >
                  <Icon name="UserIcon" size={20} className="text-foreground" />
                </button>
              )}
            </div>
          </div>


          {/* Sub-header for Mobile Navigation / Search */}
          <div className="mt-3 lg:hidden">
            {!title && <SearchBar />}
          </div>
        </div>

      </header>

      {/* Page Title & Back Button Section (for internal pages) */}
      {(showBack || title) && (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-2 flex items-center gap-3">
          {showBack && (
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors pr-2"
            >
              <Icon name="ArrowLeftIcon" size={20} />
            </button>
          )}
          {title && (
            <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{title}</span>
          )}
        </div>
      )}

      {/* Location Overlay (Shared) */}
      {showLocationDropdown && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <button 
              onClick={() => setShowLocationDropdown(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-foreground"
            >
              <Icon name="ArrowLeftIcon" size={20} />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">Delivery Location</h2>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Select your area</p>
            </div>
          </div>
          
          <div className="p-4 max-w-2xl mx-auto w-full">
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Icon name="MagnifyingGlassIcon" size={16} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search for area, street name..."
                className="w-full bg-muted border-none rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
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
                    <p className={`text-sm font-semibold ${loc === location ? 'text-primary' : 'text-foreground'}`}>{loc?.split(',')?.[0]}</p>
                    <p className="text-xs text-muted-foreground font-medium truncate">{loc}</p>
                  </div>
                  {loc === location && <Icon name="CheckCircleIcon" size={18} className="text-primary" variant="solid" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
