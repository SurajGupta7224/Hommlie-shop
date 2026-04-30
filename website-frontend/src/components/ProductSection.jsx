import { FiArrowRight } from 'react-icons/fi';
import ProductCard from './ProductCard';

export const newProducts = [
  { id: 1, name: '100 Percent Apple Juice – 64 fl oz Bottle',     emoji: '🍎', price: 0.50, oldPrice: 1.99, tag: 'ORGANIC', rating: 4, reviews: 3, stock: 23 },
  { id: 2, name: 'Great Value Rising Crust Frozen Pizza, Supreme', emoji: '🍕', price: 8.99, oldPrice: 9.99, tag: 'COLD SALE', rating: 4, reviews: 3, stock: 18 },
  { id: 3, name: 'Simply Orange Pulp Free Juice – 52 fl oz',       emoji: '🍊', price: 2.45, oldPrice: 4.13, rating: 4, reviews: 2, stock: 27 },
  { id: 4, name: 'California Pizza Kitchen Margherita, Crispy Thin Crust', emoji: '🫓', price: 11.77, oldPrice: 14.77, tag: 'COLD SALE', rating: 4, reviews: 3, stock: 19 },
  { id: 5, name: 'Cantaloupe Melon Fresh Organic Cut',              emoji: '🍈', price: 1.25, oldPrice: 2.88, tag: 'ORGANIC', rating: 5, reviews: 3, stock: 16 },
  { id: 6, name: 'Angel Soft Toilet Paper, 9 Mega Rolls',          emoji: '🧻', price: 14.12, oldPrice: 17.12, rating: 3, reviews: 3, stock: 32 },
  { id: 7, name: 'Greek Yogurt Honey Vanilla Bliss Pack',           emoji: '🫙', price: 3.49, oldPrice: 5.99, tag: 'ORGANIC', rating: 5, reviews: 8, stock: 45 },
  { id: 8, name: 'Premium Mixed Nuts Variety Pack 1lb',             emoji: '🥜', price: 9.99, oldPrice: 13.50, rating: 4, reviews: 11, stock: 28 },
];

export const newArrivals = [
  { id: 11, name: 'Organic Almond Milk Unsweetened 64 fl oz',       emoji: '🥛', price: 4.29, oldPrice: 5.99, tag: 'ORGANIC', rating: 5, reviews: 6, stock: 40 },
  { id: 12, name: 'Avocado Toast Spread — Garlic & Herb',           emoji: '🥑', price: 5.75, oldPrice: 7.99, rating: 4, reviews: 4, stock: 22 },
  { id: 13, name: 'Frozen Blueberries Premium Bag 48 oz',           emoji: '🫐', price: 6.49, oldPrice: 8.99, tag: 'COLD SALE', rating: 4, reviews: 9, stock: 35 },
  { id: 14, name: 'Whole Grain Oats Instant Variety Pack',          emoji: '🥣', price: 3.99, oldPrice: 5.49, tag: 'ORGANIC', rating: 5, reviews: 14, stock: 55 },
  { id: 15, name: 'Sparkling Water 24-Pack Variety',                emoji: '💧', price: 11.99, oldPrice: 15.99, rating: 4, reviews: 22, stock: 48 },
  { id: 16, name: 'Strawberry Jam No Added Sugar 16 oz',            emoji: '🍓', price: 3.25, oldPrice: 4.75, tag: 'ORGANIC', rating: 5, reviews: 7, stock: 30 },
  { id: 17, name: 'Sourdough Artisan Loaf Fresh Baked',             emoji: '🍞', price: 4.50, oldPrice: 5.99, rating: 4, reviews: 5, stock: 12 },
  { id: 18, name: 'Coconut Water 100% Pure 6-Pack',                 emoji: '🥥', price: 8.99, oldPrice: 11.99, tag: 'ORGANIC', rating: 5, reviews: 19, stock: 60 },
];

function ProductSection({ id, title, subtitle, products }) {
  return (
    <section id={id} className="py-14" style={{ background: 'var(--bg)' }}>
      <div className="container-main">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title uppercase tracking-wide text-sm font-bold mb-0.5" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
              {id.replace(/-/g, ' ')}
            </h2>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
            {subtitle && <p className="section-subtitle mt-1">{subtitle}</p>}
          </div>
          <a
            href="#"
            id={`${id}-view-all`}
            className="flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-3"
            style={{ color: 'var(--primary)' }}
          >
            View All <FiArrowRight size={16} />
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewProductsSection() {
  return (
    <ProductSection
      id="new-products"
      title="New Products"
      subtitle="Some of the new products arriving this week"
      products={newProducts}
    />
  );
}

export function NewArrivalsSection() {
  return (
    <ProductSection
      id="new-arrivals"
      title="New Arrivals"
      subtitle="Do not miss the current offers until the end of month."
      products={newArrivals}
    />
  );
}
