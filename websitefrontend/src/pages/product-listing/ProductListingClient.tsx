
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/AppIcon';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ProductGrid from './ProductGrid';
import SortDropdown from './SortDropdown';
import api from '@/api';

export default function ProductListingClient() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const categorySlug = searchParams.get('category') || 'all';
  const subcategorySlug = searchParams.get('subcategory') || 'all';

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.status === 1) {
          setCategories(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (slug: string) => {
    if (slug === 'all') {
      navigate('/product-listing');
    } else {
      navigate(`/product-listing?category=${slug}`);
    }
  };

  const handleSubcategoryClick = (catSlug: string, subSlug: string) => {
    navigate(`/product-listing?category=${catSlug}&subcategory=${subSlug}`);
  };

  // Find active category object for subcategory display
  const activeCategory = categories.find(c => c.slug === categorySlug);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header title="All Products" showBack={true} />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6">
        <div className="md:flex md:gap-8">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              {/* Sort */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card mb-6">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Sort By</p>
                </div>
                <div className="p-1">
                  {[
                    { value: 'popularity', label: 'Popularity' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Top Rated' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${sortBy === opt.value ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-muted'}`}
                    >
                      {opt.label}
                      {sortBy === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Categories</p>
                </div>
                <div className="p-1 max-h-[60vh] overflow-y-auto no-scrollbar">
                  <button
                    onClick={() => handleCategoryClick('all')}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all ${categorySlug === 'all' ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-muted'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base">🛒</div>
                    All Products
                    {categorySlug === 'all' && <Icon name="CheckIcon" size={14} className="text-primary ml-auto" />}
                  </button>

                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <button
                        onClick={() => handleCategoryClick(cat.slug)}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all ${categorySlug === cat.slug ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-muted'}`}
                      >
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-lg object-contain bg-muted p-1" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs">📦</div>
                        )}
                        <span className="truncate">{cat.name}</span>
                        {categorySlug === cat.slug && <Icon name="CheckIcon" size={14} className="text-primary ml-auto" />}
                      </button>
                      
                      {/* Nested Subcategories in Sidebar */}
                      {categorySlug === cat.slug && cat.subCategories && cat.subCategories.length > 0 && (
                        <div className="ml-11 pr-2 pb-2 flex flex-col gap-1">
                          {cat.subCategories.map((sub: any) => (
                            <button
                              key={sub.id}
                              onClick={() => handleSubcategoryClick(cat.slug, sub.slug)}
                              className={`text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${subcategorySlug === sub.slug ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Product Area */}
          <div className="flex-1 min-w-0">
            {/* Header info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground capitalize">
                  {categorySlug === 'all' ? 'All Products' : (activeCategory?.name || categorySlug)}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {subcategorySlug !== 'all' ? `Showing ${subcategorySlug}` : `Showing everything`} in {categorySlug}
                </p>
              </div>
              <div className="hidden md:block">
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>
            </div>

            {/* Subcategory Pills (Horizontal) */}
            {activeCategory && activeCategory.subCategories && activeCategory.subCategories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar">
                <button
                  onClick={() => handleCategoryClick(categorySlug)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all border ${subcategorySlug === 'all' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-border text-foreground hover:border-primary/50'}`}
                >
                  All {activeCategory.name}
                </button>
                {activeCategory.subCategories.map((sub: any) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSubcategoryClick(categorySlug, sub.slug)}
                    className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all border ${subcategorySlug === sub.slug ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-border text-foreground hover:border-primary/50'}`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}

            {/* The Grid */}
            <ProductGrid 
              category={categorySlug} 
              subcategory={subcategorySlug} 
              sort={sortBy} 
            />
          </div>
        </div>
      </main>

      <Footer />
      <div className="md:hidden">
        <BottomNav active="categories" />
      </div>
    </div>
  );
}
