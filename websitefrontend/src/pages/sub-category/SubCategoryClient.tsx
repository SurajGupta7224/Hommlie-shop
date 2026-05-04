
import { useParams, Link, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { useCart } from '@/context/CartContext';

const subcategoriesData: Record<string, { name: string; emoji: string; color: string; border: string }[]> = {
  'Fruits': [
    { name: 'Seasonal', emoji: '🥭', color: 'bg-orange-50', border: 'border-orange-100' },
    { name: 'Exotic', emoji: '🥝', color: 'bg-green-50', border: 'border-green-100' },
    { name: 'Local', emoji: '🍌', color: 'bg-yellow-50', border: 'border-yellow-100' },
  ],
  'Vegetables': [
    { name: 'Leafy Greens', emoji: '🥬', color: 'bg-green-50', border: 'border-green-100' },
    { name: 'Roots', emoji: '🥕', color: 'bg-orange-50', border: 'border-orange-100' },
    { name: 'Organic', emoji: '🥦', color: 'bg-emerald-50', border: 'border-emerald-100' },
  ],
  'Dairy': [
    { name: 'Milk', emoji: '🥛', color: 'bg-blue-50', border: 'border-blue-100' },
    { name: 'Butter', emoji: '🧈', color: 'bg-yellow-50', border: 'border-yellow-100' },
    { name: 'Paneer', emoji: '🧀', color: 'bg-amber-50', border: 'border-amber-100' },
  ],
  'Snacks': [
    { name: 'Chips', emoji: '🍟', color: 'bg-yellow-50', border: 'border-yellow-100' },
    { name: 'Biscuits', emoji: '🍪', color: 'bg-amber-50', border: 'border-amber-100' },
    { name: 'Namkeen', emoji: '🥨', color: 'bg-orange-50', border: 'border-orange-100' },
  ],
  'Beverages': [
    { name: 'Juices', emoji: '🧃', color: 'bg-orange-50', border: 'border-orange-100' },
    { name: 'Tea', emoji: '🍵', color: 'bg-green-50', border: 'border-green-100' },
    { name: 'Coffee', emoji: '☕', color: 'bg-brown-50', border: 'border-brown-100' },
  ],
  'Bakery': [
    { name: 'Breads', emoji: '🍞', color: 'bg-amber-50', border: 'border-amber-100' },
    { name: 'Cakes', emoji: '🍰', color: 'bg-pink-50', border: 'border-pink-100' },
    { name: 'Cookies', emoji: '🍪', color: 'bg-yellow-50', border: 'border-yellow-100' },
  ],
  'Meat': [
    { name: 'Chicken', emoji: '🍗', color: 'bg-red-50', border: 'border-red-100' },
    { name: 'Mutton', emoji: '🍖', color: 'bg-rose-50', border: 'border-rose-100' },
    { name: 'Fish', emoji: '🐟', color: 'bg-blue-50', border: 'border-blue-100' },
  ],
  'Household': [
    { name: 'Cleaners', emoji: '🧹', color: 'bg-purple-50', border: 'border-purple-100' },
    { name: 'Detergents', emoji: '🧼', color: 'bg-indigo-50', border: 'border-indigo-100' },
    { name: 'Paper', emoji: '🧻', color: 'bg-gray-50', border: 'border-gray-100' },
  ],
};

export default function SubCategoryClient() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  
  const subcategories = categoryName ? subcategoriesData[categoryName] || [] : [];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <div className="noise-overlay" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-border transition-colors flex-shrink-0"
            >
              <Icon name="ArrowLeftIcon" size={18} className="text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-base font-bold text-foreground">{categoryName}</h1>
              <p className="text-xs text-muted-foreground">Select a subcategory</p>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/cart" className="relative p-2 rounded-full hover:bg-muted transition-colors">
                <Icon name="ShoppingCartIcon" size={20} className="text-foreground" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-0.5 right-0.5 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {getTotalItems() > 9 ? '9+' : getTotalItems()}
                  </span>
                )}
              </Link>
              <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                <AppLogo size={24} />
                <span className="font-bold text-sm text-foreground">Hommlie Shop</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="reveal active">
          <h2 className="text-xl font-extrabold text-foreground mb-6">Explore {categoryName}</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {subcategories.map((sub) => (
              <Link 
                key={sub.name} 
                to={`/product-listing?category=${categoryName}&subcategory=${sub.name}`}
              >
                <div className={`${sub.color} ${sub.border} border rounded-3xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 group`}>
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-4xl transition-transform duration-500 group-hover:rotate-12">
                    {sub.emoji}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{sub.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">View Products</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {subcategories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="text-6xl mb-4">🔍</span>
              <p className="text-lg font-bold text-foreground">No subcategories found</p>
              <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold hover:underline">Go back home</button>
            </div>
          )}
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
      
      <div className="md:hidden">
        <BottomNav active="none" />
      </div>
    </div>
  );
}
