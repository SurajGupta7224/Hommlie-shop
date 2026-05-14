

import { useCart, type CartItem } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Image */}
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
        <img src={item.product.image || 'https://via.placeholder.com/400'} alt={item.product.name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight truncate">{item.product.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground font-medium">{item.variation.name || item.variation.unit || '1 unit'}</p>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <p className="text-sm font-bold text-foreground">₹{item.total}</p>
        </div>
      </div>

      {/* Qty Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => {
            if (item.quantity > 1) {
              updateQuantity(item.id, item.quantity - 1);
            } else {
              removeItem(item.product.id, item.variation.id);
            }
          }}
          className="flex items-center justify-center w-7 h-7 rounded-full border border-border hover:border-danger hover:bg-danger/10 transition-all active:scale-90"
        >
          <Icon name="MinusIcon" size={12} className="text-foreground" />
        </button>
        <span className="text-sm font-bold text-foreground w-5 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-primary hover:bg-primary/90 transition-all active:scale-90"
        >
          <Icon name="PlusIcon" size={12} className="text-white" />
        </button>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.product.id, item.variation.id)}
        className="ml-1 flex items-center justify-center w-7 h-7 rounded-full hover:bg-danger/10 transition-colors flex-shrink-0"
      >
        <Icon name="TrashIcon" size={14} className="text-muted-foreground hover:text-danger" />
      </button>
    </div>
  );
}
