

import { Link } from 'react-router-dom';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import CartItemRow from './CartItemRow';
import PriceSummary from './PriceSummary';

export default function CartClient() {
  const { items, getTotalItems, getTotalPrice } = useCart();
  const isEmpty = items?.length === 0;

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      {/* Header */}
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-3">
          <Link to="/product-listing" className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-border transition-colors flex-shrink-0">
            <Icon name="ArrowLeftIcon" size={18} className="text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-bold text-foreground">Your Cart</h1>
            <p className="text-xs text-muted-foreground">{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}</p>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
              <Icon name="HomeIcon" size={16} className="text-muted-foreground" />
              Home
            </Link>
            <Link to="/product-listing" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
              <Icon name="Squares2X2Icon" size={16} className="text-muted-foreground" />
              Categories
            </Link>
            <Link to="/cart" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-primary bg-secondary transition-colors">
              <Icon name="ShoppingCartIcon" size={16} className="text-primary" variant="solid" />
              Cart
            </Link>
          </nav>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <AppLogo size={24} />
            <span className="font-bold text-sm text-foreground hidden sm:block">Hommlie Shop</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6">
        {isEmpty ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-4xl">🛒</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Add items from our wide selection of fresh groceries
            </p>
            <Link to="/product-listing">
              <button className="mt-2 bg-primary text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-primary/90 transition-all active:scale-95 shadow-primary">
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
                  <h2 className="text-sm font-bold text-foreground">Order Items ({getTotalItems()})</h2>
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
                    <p className="text-white text-lg font-bold">₹{getTotalPrice() + (getTotalPrice() < 199 ? 30 : 0)}</p>
                  </div>
                  <button className="bg-white text-primary font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-white/90 transition-all active:scale-95 flex items-center gap-2">
                    Checkout
                    <Icon name="ArrowRightIcon" size={16} className="text-primary" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Checkout Bar — mobile only */}
      {!isEmpty && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 max-w-lg mx-auto px-4 pb-2 slide-up">
          <div className="bg-primary rounded-2xl p-4 shadow-primary flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs font-medium">Total Amount</p>
              <p className="text-white text-lg font-bold">₹{getTotalPrice() + (getTotalPrice() < 199 ? 30 : 0)}</p>
            </div>
            <button className="bg-white text-primary font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-white/90 transition-all active:scale-95 flex items-center gap-2">
              Checkout
              <Icon name="ArrowRightIcon" size={16} className="text-primary" />
            </button>
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
