

import { Link } from 'react-router-dom';
import Icon from '@/components/ui/AppIcon';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import CartItemRow from './CartItemRow';
import PriceSummary from './PriceSummary';

export default function CartClient() {
  const { items, getTotalItems, getTotalPrice } = useCart();
  const isEmpty = items?.length === 0;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Header title="Your Cart" showBack={true} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6 pb-20">
        {isEmpty ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-4xl">🛒</span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Add items from our wide selection of fresh groceries
            </p>
            <Link to="/product-listing">
              <button className="mt-2 bg-primary text-white font-semibold text-base px-8 py-3 rounded-full hover:bg-primary/90 transition-all active:scale-95 shadow-primary">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          /* Desktop: Two-column layout */
          <div className="md:flex md:gap-8 md:items-start">
            {/* Left: Cart Items */}
            <div className="flex-1 min-w-0">
              {/* Delivery Badge */}
              <div className="flex items-center gap-2 bg-success/10 rounded-2xl px-4 py-3 mb-4">
                <Icon name="BoltIcon" size={16} className="text-success" variant="solid" />
                <div>
                  <p className="text-sm font-bold text-success">Delivery in 10 minutes</p>
                  <p className="text-xs text-muted-foreground">Your order will be at your door soon</p>
                </div>
              </div>

              {/* Cart Items */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden mb-4 shadow-card">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="text-base font-semibold text-foreground">Order Items ({getTotalItems()})</h2>
                </div>
                <div className="divide-y divide-border">
                  {items?.map((item) => (
                    <CartItemRow key={item?.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Add more items */}
              <Link to="/product-listing">
                <div className="flex items-center gap-2 bg-secondary border border-primary/20 rounded-2xl px-4 py-3 mb-4 cursor-pointer hover:bg-primary/10 transition-colors">
                  <Icon name="PlusCircleIcon" size={18} className="text-primary" />
                  <span className="text-sm font-semibold text-primary">Add more items</span>
                </div>
              </Link>

              {/* Price Summary — mobile only (desktop shows in right column) */}
              <div className="md:hidden">
                <PriceSummary />
              </div>
            </div>

            {/* Right: Price Summary + Checkout — desktop only */}
            <div className="hidden md:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <PriceSummary />

                {/* Checkout Button */}
                <div className="bg-primary rounded-2xl p-4 shadow-primary flex items-center justify-between mt-4">
                  <div>
                    <p className="text-white/80 text-xs font-medium">Total Amount</p>
                    <p className="text-white text-xl font-semibold">₹{getTotalPrice() + (getTotalPrice() < 199 ? 30 : 0)}</p>
                  </div>
                  <Link to="/checkout" className="bg-white text-primary font-semibold text-base px-6 py-2.5 rounded-xl hover:bg-white/90 transition-all active:scale-95 flex items-center gap-2">
                    Checkout
                    <Icon name="ArrowRightIcon" size={16} className="text-primary" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Checkout Bar — mobile only */}
      {!isEmpty && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 max-w-lg mx-auto px-4 pb-4 slide-up">
          <div className="bg-primary rounded-2xl p-4 shadow-primary flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs font-medium">Total Amount</p>
              <p className="text-white text-lg font-bold">₹{getTotalPrice() + (getTotalPrice() < 199 ? 30 : 0)}</p>
            </div>
            <Link to="/checkout" className="bg-white text-primary font-semibold text-base px-6 py-2.5 rounded-xl hover:bg-white/90 transition-all active:scale-95 flex items-center gap-2">
              Checkout
              <Icon name="ArrowRightIcon" size={16} className="text-primary" />
            </Link>
          </div>
        </div>
      )}

      <div className="md:hidden">
        <BottomNav active="cart" />
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
