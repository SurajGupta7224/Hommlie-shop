import { FiArrowRight } from 'react-icons/fi';

const categories = [
  { id: 1, emoji: '🥦', label: 'Fruits & Vegetables', count: '120+ items', color: '#E8F5E9', accent: '#4CAF50' },
  { id: 2, emoji: '🍼', label: 'Baby & Pregnancy',    count: '85+ items',  color: '#FFF3E0', accent: '#FF9800' },
  { id: 3, emoji: '🧃', label: 'Beverages',           count: '200+ items', color: '#E3F2FD', accent: '#2196F3' },
  { id: 4, emoji: '🍗', label: 'Meats & Seafood',     count: '95+ items',  color: '#FCE4EC', accent: '#E91E63' },
  { id: 5, emoji: '🍪', label: 'Biscuits & Snacks',   count: '150+ items', color: '#FFF8E1', accent: '#FFC107' },
  { id: 6, emoji: '🍞', label: 'Breads & Bakery',     count: '70+ items',  color: '#F3E5F5', accent: '#9C27B0' },
  { id: 7, emoji: '🥛', label: 'Breakfast & Dairy',   count: '110+ items', color: '#E0F7FA', accent: '#00BCD4' },
  { id: 8, emoji: '🧊', label: 'Frozen Foods',        count: '60+ items',  color: '#E8EAF6', accent: '#3F51B5' },
  { id: 9, emoji: '🛒', label: 'Grocery & Staples',   count: '300+ items', color: '#F1F8E9', accent: '#8BC34A' },
];

export function CategoryCard({ item }) {
  return (
    <a
      href="#"
      id={`category-card-${item.id}`}
      className="flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 group cursor-pointer"
      style={{
        background: item.color,
        border: '1.5px solid transparent',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = item.accent;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${item.accent}30`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: 'white', boxShadow: `0 4px 12px ${item.accent}25` }}
      >
        {item.emoji}
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold leading-tight" style={{ color: '#2D3436' }}>
          {item.label}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: item.accent, fontWeight: 600 }}>
          {item.count}
        </p>
      </div>
    </a>
  );
}

export default function CategorySection() {
  return (
    <section id="categories" className="py-14" style={{ background: 'var(--bg-white)' }}>
      <div className="container-main">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">Top Categories</h2>
            <p className="section-subtitle mt-1">New products with updated stocks.</p>
          </div>
          <a
            href="#"
            id="categories-view-all"
            className="flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-3"
            style={{ color: 'var(--primary)' }}
          >
            View All <FiArrowRight size={16} />
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
          {categories.map(cat => (
            <CategoryCard key={cat.id} item={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
