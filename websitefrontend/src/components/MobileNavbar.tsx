
import { Link, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function MobileNavbar() {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const { isLoggedIn } = useAuth();
  const totalItems = getTotalItems();

  const navItems = [
    { label: 'Home', path: '/', icon: 'HomeIcon' },
    { label: 'Categories', path: '/product-listing', icon: 'Squares2X2Icon' },
    { label: 'Cart', path: '/cart', icon: 'ShoppingCartIcon', badge: totalItems },
    { label: 'Profile', path: isLoggedIn ? '/profile' : '/profile', icon: 'UserIcon' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-100 px-2 py-2 md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all relative ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-500'}`}
            >
              <div className="relative">
                <Icon 
                  name={item.icon as any} 
                  size={22} 
                  variant={isActive ? 'solid' : 'outline'} 
                  className={isActive ? 'text-primary' : 'text-slate-500'}
                />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center border border-white">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
