

import { Link } from 'react-router-dom';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/context/CartContext';

interface BottomNavProps {
  active: 'home' | 'categories' | 'cart' | 'profile' | 'none';
}

export default function BottomNav({ active }: BottomNavProps) {
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();

  const navItems = [
    { key: 'home', label: 'Home', icon: 'HomeIcon', href: '/' },
    { key: 'categories', label: 'Categories', icon: 'Squares2X2Icon', href: '/product-listing' },
    { key: 'cart', label: 'Cart', icon: 'ShoppingCartIcon', href: '/cart' },
    { key: 'profile', label: 'Profile', icon: 'UserIcon', href: '/' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border shadow-bottom-nav">
      <div className="max-w-lg mx-auto px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = active === item.key;
          return (
            <Link key={item.key} to={item.href}>
              <div className={`bottom-nav-item relative px-4 py-1.5 rounded-2xl transition-all duration-200 ${isActive ? 'active bg-secondary' : 'hover:bg-muted'}`}>
                <div className="relative">
                  <Icon
                    name={item.icon as Parameters<typeof Icon>[0]['name']}
                    size={22}
                    variant={isActive ? 'solid' : 'outline'}
                    className={isActive ? 'text-primary' : 'text-muted-foreground'}
                  />
                  {item.key === 'cart' && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
