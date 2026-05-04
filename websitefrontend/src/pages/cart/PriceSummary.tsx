

import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';

export default function PriceSummary() {
  const { getTotalPrice, items } = useCart();
  const subtotal = getTotalPrice();
  const deliveryFee = subtotal < 199 ? 30 : 0;
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee - discount;

  const totalOriginal = items?.reduce((acc, item) => {
    return acc + (item?.price * item?.qty);
  }, 0);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card mb-4">
      {/* Savings Banner */}
      <div className="bg-success/10 px-4 py-2.5 flex items-center gap-2">
        <Icon name="TagIcon" size={14} className="text-success" variant="solid" />
        <span className="text-xs font-semibold text-success">You are saving ₹{discount + (items?.reduce((acc, item) => acc + ((item?.price) * item?.qty), 0) - totalOriginal < 0 ? Math.abs(items?.reduce((acc, item) => acc + ((item?.price) * item?.qty), 0) - totalOriginal) : 0)} on this order!</span>
      </div>
      <div className="px-4 py-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Price Details</h3>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-sm font-semibold text-foreground">₹{subtotal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Delivery Fee</span>
            {deliveryFee === 0 ? (
              <span className="text-sm font-semibold text-success">FREE</span>
            ) : (
              <span className="text-sm font-semibold text-foreground">₹{deliveryFee}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Member Discount (5%)</span>
            <span className="text-sm font-semibold text-success">-₹{discount}</span>
          </div>

          <div className="h-px bg-border my-1" />

          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-foreground">Total</span>
            <span className="text-base font-bold text-foreground">₹{total}</span>
          </div>
        </div>

        {deliveryFee > 0 && (
          <div className="mt-3 flex items-center gap-1.5 bg-accent/10 rounded-xl px-3 py-2">
            <Icon name="InformationCircleIcon" size={14} className="text-accent" />
            <span className="text-xs font-medium text-accent">Add ₹{199 - subtotal} more for FREE delivery</span>
          </div>
        )}
      </div>
    </div>
  );
}
