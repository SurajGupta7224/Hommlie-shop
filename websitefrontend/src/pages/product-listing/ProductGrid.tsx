
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';

const allProducts = [
  { id: 'g1', name: 'Amul Taaza Milk', weight: '1 L', price: 62, originalPrice: 68, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', rating: 4.8, category: 'Dairy', subcategory: 'Milk', badge: 'Bestseller' },
  { id: 'g2', name: 'Fresh Tomatoes', weight: '500 g', price: 28, originalPrice: 35, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80', rating: 4.5, category: 'Vegetables', subcategory: 'Roots', badge: 'Fresh' },
  { id: 'g3', name: "Lay's Classic Salted", weight: '90 g', price: 20, originalPrice: 20, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80', rating: 4.7, category: 'Snacks', subcategory: 'Chips', badge: null },
  { id: 'g4', name: 'Britannia Brown Bread', weight: '400 g', price: 45, originalPrice: 50, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', rating: 4.4, category: 'Bakery', subcategory: 'Breads', badge: null },
  { id: 'g5', name: 'Tropicana Orange Juice', weight: '1 L', price: 99, originalPrice: 120, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80', rating: 4.6, category: 'Beverages', subcategory: 'Juices', badge: '17% off' },
  { id: 'g6', name: 'Royal Gala Apples', weight: '1 kg', price: 149, originalPrice: 180, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', rating: 4.5, category: 'Fruits', subcategory: 'Seasonal', badge: 'Organic' },
  { id: 'g7', name: 'Paneer Fresh', weight: '200 g', price: 85, originalPrice: 95, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80', rating: 4.7, category: 'Dairy', subcategory: 'Paneer', badge: null },
  { id: 'g8', name: 'Baby Spinach', weight: '250 g', price: 39, originalPrice: 45, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', rating: 4.3, category: 'Vegetables', subcategory: 'Leafy Greens', badge: 'Fresh' },
  { id: 'g9', name: 'Kurkure Masala Munch', weight: '80 g', price: 20, originalPrice: 20, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80', rating: 4.5, category: 'Snacks', subcategory: 'Namkeen', badge: null },
  { id: 'g10', name: 'Alphonso Mangoes', weight: '1 kg', price: 299, originalPrice: 350, image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&q=80', rating: 4.9, category: 'Fruits', subcategory: 'Exotic', badge: 'Premium' },
  { id: 'g11', name: 'Amul Butter', weight: '500 g', price: 245, originalPrice: 280, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80', rating: 4.8, category: 'Dairy', subcategory: 'Butter', badge: null },
  { id: 'g12', name: 'Whole Wheat Atta', weight: '5 kg', price: 220, originalPrice: 260, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80', rating: 4.6, category: 'Bakery', subcategory: 'Breads', badge: '15% off' },
];

interface ProductGridProps {
  category: string;
  subcategory: string;
  sort: string;
}

export default function ProductGrid({ category, subcategory, sort }: ProductGridProps) {
  const { addItem, removeItem, getItemQty } = useCart();

  const products = useMemo(() => {
    let list = category === 'all' ? allProducts : allProducts.filter((p) => p.category === category);
    if (subcategory !== 'all') {
      list = list.filter((p) => p.subcategory === subcategory);
    }
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, subcategory, sort]);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <span className="text-5xl">🔍</span>
        <p className="text-base font-semibold text-foreground">No products found</p>
        <p className="text-sm text-muted-foreground">Try a different category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => {
        const qty = getItemQty(product.id);
        const discount = product.originalPrice > product.price
          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
          : 0;

        return (
          <div key={product.id} className="product-card flex flex-col group">
            {/* Image */}
            <Link to={`/product/${product.id}`} className="relative h-36 bg-muted overflow-hidden block">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              {product.badge && (
                <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full z-10 shadow-sm">
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-2 right-2 bg-success text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full z-10 shadow-sm">
                  -{discount}%
                </span>
              )}
            </Link>

            {/* Content */}
            <div className="p-3 flex flex-col flex-1">
              <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{product.weight}</p>
              <Link to={`/product/${product.id}`} className="block">
                <p className="text-sm font-semibold text-foreground leading-tight mb-1.5 line-clamp-2 hover:text-primary transition-colors cursor-pointer">{product.name}</p>
              </Link>

              <div className="flex items-center gap-1 mb-2">
                <Icon name="StarIcon" size={11} className="text-accent" variant="solid" />
                <span className="text-[11px] font-semibold text-foreground">{product.rating}</span>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div>
                  <span className="text-lg font-semibold text-foreground">₹{product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-[11px] text-muted-foreground line-through ml-1">₹{product.originalPrice}</span>
                  )}
                </div>

                {qty === 0 ? (
                  <button
                    onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image, weight: product.weight })}
                    className="add-btn"
                  >
                    +
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => removeItem(product.id)} className="qty-btn">−</button>
                    <span className="text-base font-semibold text-foreground w-4 text-center">{qty}</span>
                    <button onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image, weight: product.weight })} className="qty-btn bg-primary text-white border-primary">+</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
