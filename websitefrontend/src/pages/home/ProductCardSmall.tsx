
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';

interface Product {
  id: string | number;
  name: string;
  slug?: string;
  category_slug?: string;
  subcategory_slug?: string;
  weight: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  category?: string;
  badge: string | null;
}

export default function ProductCardSmall({ product }: { product: Product }) {
  const { addItem, removeItem, getItemQty } = useCart();
  const qty = getItemQty(String(product.id));
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // SEO Friendly Path: /cat/subcat/slug
  // Fallback: /product/slug or /product/id
  const productPath = (product.category_slug && product.subcategory_slug && product.slug)
    ? `/${product.category_slug}/${product.subcategory_slug}/${product.slug}`
    : product.slug ? `/product/${product.slug}` : `/product/${product.id}`;

  return (
    <div className="product-card w-full flex flex-col group h-full">
      {/* Image */}
      <Link to={productPath} className="relative h-28 bg-muted overflow-hidden block">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No Img</div>
        )}
        {product.badge && (
          <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full z-10">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-success text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full z-10">
            -{discount}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-2.5 flex flex-col flex-1">
        <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{product.weight}</p>
        <Link to={productPath} className="block">
          <p className="text-xs font-semibold text-foreground leading-tight mb-1 line-clamp-2 hover:text-primary transition-colors cursor-pointer">{product.name}</p>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-0.5 mb-2">
          <Icon name="StarIcon" size={10} className="text-accent" variant="solid" />
          <span className="text-[10px] font-semibold text-foreground">{product.rating || 4.5}</span>
        </div>

        {/* Price + Add */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-[9px] text-muted-foreground line-through opacity-60">₹{product.originalPrice}</span>
            )}
          </div>

          {qty === 0 ? (
            <button
              onClick={() => addItem({ id: String(product.id), name: product.name, price: product.price, image: product.image, weight: product.weight })}
              className="add-btn w-7 h-7 text-base font-semibold"
            >
              +
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={() => removeItem(String(product.id))} className="qty-btn">−</button>
              <span className="text-xs font-semibold text-foreground w-4 text-center">{qty}</span>
              <button onClick={() => addItem({ id: String(product.id), name: product.name, price: product.price, image: product.image, weight: product.weight })} className="qty-btn bg-primary text-white border-primary hover:bg-primary/80 font-semibold">+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
