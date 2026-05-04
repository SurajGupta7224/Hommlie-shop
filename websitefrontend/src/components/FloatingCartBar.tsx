
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';

export default function FloatingCartBar() {
  const { getTotalItems, getTotalPrice } = useCart();
  const location = useLocation();
  const totalItems = getTotalItems();

  // Don't show on cart or checkout pages, or if cart is empty
  const hideOnPages = ['/cart', '/checkout'];
  if (totalItems === 0 || hideOnPages.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:hidden animate-in slide-in-from-bottom duration-300">
      <Link to="/cart">
        <div className="bg-primary text-white rounded-2xl p-4 shadow-lg flex items-center justify-between group active:scale-[0.98] transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Icon name="ShoppingCartIcon" size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none">{totalItems} {totalItems === 1 ? 'item' : 'items'} added</span>
              <span className="text-xs text-white/80 font-medium mt-1">₹{getTotalPrice()} plus taxes</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 font-bold text-sm">
            <span>View Cart</span>
            <Icon name="ArrowRightIcon" size={16} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </div>
  );
}
