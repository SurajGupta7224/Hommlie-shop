

import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';

export default function PriceSummary() {
  const { getSubtotal, getDeliveryFee, getFinalTotal, items, summary } = useCart();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const handlingFee = summary?.handling_fee || 0;
  const total = getFinalTotal();

  const totalOriginal = items?.reduce((acc, item) => {
    return acc + (item?.price * item?.quantity);
  }, 0);

  const savings = totalOriginal - subtotal;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card mb-4">
      {/* Savings Banner */}
      {savings > 0 && (
        <div className="bg-success/10 px-4 py-2.5 flex items-center gap-2">
          <Icon name="TagIcon" size={14} className="text-success" variant="solid" />
          <span className="text-xs font-semibold text-success">You are saving ₹{savings} on this order!</span>
        </div>
      )}
      <div className="px-4 py-4">
        <h3 className="text-base font-semibold text-foreground mb-3">Price Details</h3>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-sm font-semibold text-foreground">₹{subtotal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Delivery Fee</span>
            <span className="text-sm font-semibold text-foreground">₹{deliveryFee}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Handling & Tax</span>
            <span className="text-sm font-semibold text-foreground">₹{(parseFloat(handlingFee as any) + parseFloat(summary?.tax as any || 0)).toFixed(2)}</span>
          </div>

          <div className="h-px bg-border my-1" />

          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-lg font-semibold text-foreground">₹{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
