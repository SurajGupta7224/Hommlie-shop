
import ProductCardSmall from './ProductCardSmall';

interface BestSellersProps {
  products: any[];
}

export default function BestSellers({ products }: BestSellersProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {products.map((product) => {
        const defaultVar = product.variations?.[0] || {};
        const formattedProduct = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          category_slug: product.category_slug,
          subcategory_slug: product.subcategory_slug,
          weight: defaultVar.label,
          price: defaultVar.discount_price || defaultVar.price,
          originalPrice: defaultVar.price,
          image: product.thumbnail,
          rating: product.rating,
          badge: product.is_best_seller ? 'Bestseller' : null,
          discount_percent: defaultVar.discount_percent
        };
        
        return <ProductCardSmall key={product.id} product={formattedProduct} />;
      })}
    </div>
  );
}
