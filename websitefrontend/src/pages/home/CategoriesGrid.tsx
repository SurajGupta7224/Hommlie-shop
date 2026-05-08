
import { Link } from 'react-router-dom';

interface CategoriesGridProps {
  categories: any[];
}

const colors = [
  'bg-red-50 border-red-100',
  'bg-green-50 border-green-100',
  'bg-blue-50 border-blue-100',
  'bg-yellow-50 border-yellow-100',
  'bg-orange-50 border-orange-100',
  'bg-amber-50 border-amber-100',
  'bg-rose-50 border-rose-100',
  'bg-purple-50 border-purple-100',
];

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
      {categories.map((cat, index) => {
        const colorClass = colors[index % colors.length];
        return (
          <Link key={cat.id} to={`/product-listing?category=${cat.slug}`}>
            <div className={`${colorClass} border rounded-[1.25rem] flex flex-col items-center justify-center py-3 md:py-4 px-1 gap-1.5 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95`}>
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xl">📦</span>
                )}
              </div>
              <span className="text-[10px] md:text-[11px] font-semibold text-foreground text-center leading-tight truncate w-full px-1">{cat.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
