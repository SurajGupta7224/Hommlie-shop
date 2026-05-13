
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Icon from '@/components/ui/AppIcon';
import VariationSelectionModal from '@/components/VariationSelectionModal';
import BottomNav from '@/components/BottomNav';
import { useCart } from '@/context/CartContext';
import BannerSlider from './BannerSlider';
import CategoriesGrid from './CategoriesGrid';
import BestSellers from './BestSellers';
import DealsSection from './DealsSection';
import HowItWorks from './HowItWorks';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import api from '@/api';

// Global cache for actual data
let cachedData: any = null;
let currentPromise: Promise<any> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // 1 minute TTL for cache

export default function HomePageClient() {
  const { addItem, getItemQty } = useCart();
  const [data, setData] = useState<any>(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);


  useEffect(() => {
    // Check if cache is stale (older than TTL)
    const now = Date.now();
    const isStale = !cacheTimestamp || (now - cacheTimestamp) > CACHE_TTL;
    
    // If we have fresh cached data, use it
    if (cachedData && !isStale) {
      setData(cachedData);
      setLoading(false);
      return;
    }
    
    // Clear stale cache
    if (isStale) {
      cachedData = null;
      currentPromise = null;
    }

    // Singleton fetch pattern
    const getHomeData = async () => {
      if (currentPromise) {
        try {
          const resData = await currentPromise;
          setData(resData);
        } catch (err) {
          console.error("Shared promise failed:", err);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        console.log("DEBUG: Initiating homepage fetch...");
        currentPromise = api.get('/homepage').then(res => res.data.data);
        const resData = await currentPromise;
        cachedData = resData;
        cacheTimestamp = Date.now();
        setData(resData);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
        currentPromise = null; // Reset to allow retry
      } finally {
        setLoading(false);
      }
    };

    getHomeData();
  }, []);

  useEffect(() => {
    if (!loading && data) {
      const revealEls = document.querySelectorAll('.reveal');
      const observer = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('active'); }),
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls?.forEach((el) => observer?.observe(el));
      return () => observer?.disconnect();
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-24 md:pb-0">
        <Header />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">

          {/* Banner Slider */}
          <div className="reveal active mb-8">
            <BannerSlider />
        </div>

        {/* Categories Grid */}
        <div className="reveal active mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Shop by Category</h2>
            <Link to="/product-listing" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              See all
              <Icon name="ChevronRightIcon" size={14} />
            </Link>
          </div>
          <CategoriesGrid categories={data?.shopByCategory} />
        </div>

        {/* Trending Now Section */}
        <div className="reveal active mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Trending Now</h2>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-none mt-1">What others are ordering</p>
            </div>
            <Link to="/product-listing" className="group flex items-center gap-1.5 text-sm font-semibold text-primary transition-all">
              See all
              <Icon name="ArrowRightIcon" size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {data?.trendingProducts?.map((item: any) => {
              const defaultVar = item.variations?.[0] || {};
              const qty = getItemQty(item.id, defaultVar.id);
              const itemPath = `/${item.category_slug}/${item.subcategory_slug}/${item.slug}`;
              
              return (
                <div key={item.id} className="flex-shrink-0 w-48 bg-white rounded-[2rem] border border-border/50 p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`bg-gray-50 rounded-[1.5rem] h-36 flex items-center justify-center text-5xl mb-3 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="opacity-20 text-2xl">No Img</span>
                    )}
                    <button
                      onClick={() => {
                        if (item.variations && item.variations.length > 1) {
                          setSelectedProduct(item);
                          setShowVariationModal(true);
                        } else {
                          addItem({ 
                            product_id: item.id, 
                            variation_id: defaultVar.id,
                            user_id: item.user_id
                          });
                        }
                      }}
                      className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-primary transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all active:scale-90"
                    >
                      <Icon name="PlusIcon" size={20} variant="solid" />
                    </button>
                    {qty > 0 && (
                      <div className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                        {qty}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 px-1">
                    <Link to={itemPath}>
                      <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">{item.name}</h3>
                    </Link>
                    <p className="text-[11px] font-medium text-muted-foreground">{defaultVar.label}</p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-foreground">₹{defaultVar.discount_price || defaultVar.price}</span>
                        {defaultVar.discount_price < defaultVar.price && (
                          <span className="text-xs font-medium text-muted-foreground line-through opacity-50">₹{defaultVar.price}</span>
                        )}
                      </div>
                      {defaultVar.discount_percent > 0 && (
                        <div className="bg-success/10 text-success text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {defaultVar.discount_percent}% OFF
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best Sellers Section */}
        <div className="reveal active mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Best Sellers</h2>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-none mt-1">Most popular choices</p>
            </div>
            <Link to="/product-listing" className="text-sm font-semibold text-primary hover:underline">See all</Link>
          </div>
          <BestSellers products={data?.bestSellers} />
        </div>

        {/* Deals Section */}
        <div className="reveal active mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Deals of the Day</h2>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-none mt-1">Limited time offers</p>
            </div>
            <Link to="/product-listing" className="text-sm font-semibold text-primary hover:underline">See all</Link>
          </div>
          <DealsSection products={data?.dealsOfDay} />
        </div>

        <div className="reveal active mb-12">
          <HowItWorks />
        </div>
      </main>

      <Footer />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav active="home" />
      </div>
    </div>
      
      {/* Variation Selection Modal */}
      {selectedProduct && (
        <VariationSelectionModal
          isOpen={showVariationModal}
          onClose={() => setShowVariationModal(false)}
          product={{
            id: selectedProduct.id,
            name: selectedProduct.name,
            image: selectedProduct.thumbnail,
            user_id: selectedProduct.user_id,
            variations: selectedProduct.variations || []
          }}
        />
      )}
    </>
  );
}
