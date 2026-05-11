
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';
import { Link } from 'react-router-dom';

interface DealsSectionProps {
  products: any[];
}

export default function DealsSection({ products }: DealsSectionProps) {
  const { addItem, removeItem, getItemQty } = useCart();

  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {products.map((deal) => {
        const defaultVar = deal.variations?.[0] || {};
        const qty = getItemQty(deal.id, defaultVar.id);
        const price = defaultVar.discount_price || defaultVar.price;
        const oldPrice = defaultVar.price;

        return (
          <Link
            key={deal.id}
            to={`/${deal.category_slug}/${deal.subcategory_slug}/${deal.slug}`}
            className="bg-card border border-border rounded-2xl flex items-center gap-3 p-3 shadow-card hover:shadow-card-hover transition-all duration-200 no-underline"
          >
            {/* Image */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
              {deal.thumbnail ? (
                <img src={deal.thumbnail} alt={deal.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>
              )}
              {defaultVar.discount_percent > 0 && (
                <div className="absolute top-1 left-1 bg-danger text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  -{defaultVar.discount_percent}%
                </div>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground font-medium">{defaultVar.label}</p>
              <p className="text-sm font-semibold text-foreground leading-tight truncate hover:text-primary transition-colors">{deal.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-base font-bold text-foreground">₹{price}</span>
                {oldPrice > price && (
                  <span className="text-xs text-muted-foreground line-through">₹{oldPrice}</span>
                )}
                {oldPrice > price && (
                  <span className="text-[10px] font-bold text-success">Save ₹{oldPrice - price}</span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Icon name="ClockIcon" size={11} className="text-accent" />
                <span className="text-[10px] font-medium text-accent">Ends in 08h 24m</span>
              </div>
            </div>
            {/* Add button */}
            <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              {qty === 0 ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addItem({ product_id: deal.id, variation_id: defaultVar.id });
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-lg font-bold transition-all duration-200 active:scale-90 hover:bg-primary/90"
                >
                  +
                </button>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <button onClick={(e) => {
                    e.preventDefault();
                    addItem({ product_id: deal.id, variation_id: defaultVar.id });
                  }} className="qty-btn bg-primary text-white border-primary">+</button>
                  <span className="text-xs font-bold text-foreground">{qty}</span>
                  <button onClick={(e) => {
                    e.preventDefault();
                    removeItem(deal.id, defaultVar.id);
                  }} className="qty-btn">−</button>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
