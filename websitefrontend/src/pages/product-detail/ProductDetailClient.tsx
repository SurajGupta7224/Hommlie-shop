
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';
import VariationSelectionModal from '@/components/VariationSelectionModal';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import api from '@/api';

export default function ProductDetailClient() {
  const { slug, category, subcategory } = useParams();
  const { addItem, removeItem, getItemQty } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showVariationModal, setShowVariationModal] = useState(false);

  // The actual slug to fetch
  const actualSlug = slug || subcategory || category;

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!actualSlug) {
        setLoading(false);
        setErrorMsg("URL Error: Missing product identifier");
        return;
      }

      setLoading(true);
      setErrorMsg(null);
      try {
        console.log("Fetching from API:", `/products/${actualSlug}`);
        const res = await api.get(`/products/${actualSlug}`);
        
        if (res.data.status === 1) {
          const productData = res.data.data;
          setProduct(productData);
          setSelectedImage(productData.thumbnail || "");

          // Fetch related products using category slug
          if (productData.category_slug) {
            const relatedRes = await api.get(`/products/category/${productData.category_slug}`);
            if (relatedRes.data.status === 1) {
              setRelatedProducts(relatedRes.data.data.filter((p: any) => p.slug !== actualSlug).slice(0, 6));
            }
          }
        } else {
          setErrorMsg(res.data.message || "Product not found in database");
        }
      } catch (error: any) {
        console.error("API Error:", error);
        setErrorMsg(error.response?.data?.message || error.message || "Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
    window.scrollTo(0, 0);
  }, [actualSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground animate-pulse font-medium">Loading product details...</p>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header title="Product Not Found" showBack={true} />
        
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
          <div className="w-24 h-24 bg-secondary/50 text-primary rounded-full flex items-center justify-center mb-8 animate-bounce">
            <Icon name="ShoppingBagIcon" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Oops! Product is Missing</h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            The item you're looking for might have been moved or is currently unavailable. Let's get you back on track!
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link 
              to="/" 
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Continue Shopping
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white border border-border text-foreground px-8 py-4 rounded-2xl font-bold shadow-sm hover:bg-muted transition-all"
            >
              Try Again
            </button>
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

  const defaultVar = product.variations?.[0] || {};
  const qty = getItemQty(product.id, defaultVar.id);
  const discount = defaultVar.discount_percent || 0;
  const allImages = product.images || [product.thumbnail];

  return (
    <>
      <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header title={product.name} showBack={true} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left: Image Showcase */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square md:h-[500px] bg-white rounded-3xl overflow-hidden shadow-sm border border-border group">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image available</div>
              )}
              {product.is_best_seller && (
                <span className="absolute top-4 left-4 bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                  Bestseller
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-4 right-4 bg-success text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Selection */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {allImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl border-2 overflow-hidden transition-all ${selectedImage === img ? 'border-primary shadow-lg shadow-primary/10' : 'border-border hover:border-primary/50'}`}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 bg-accent/10 text-accent px-2 py-0.5 rounded-lg">
                  <Icon name="StarIcon" size={14} className="text-accent" variant="solid" />
                  <span className="text-xs font-bold">{product.rating || 4.5}</span>
                </div>
                <span className="text-xs text-muted-foreground">({product.review || 120} reviews)</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-1 leading-tight">{product.name}</h2>
              <p className="text-xl font-medium text-muted-foreground">{defaultVar.label}</p>
            </div>

            <div className="flex items-end gap-3 mb-8">
              <span className="text-4xl font-semibold text-foreground">₹{defaultVar.discount_price || defaultVar.price}</span>
              {defaultVar.discount_price < defaultVar.price && (
                <div className="flex flex-col mb-1">
                  <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">₹{defaultVar.price}</span>
                  <span className="text-xs font-semibold text-success uppercase">Save ₹{Math.round(defaultVar.price - defaultVar.discount_price)}</span>
                </div>
              )}
            </div>

            {/* Action Area */}
            <div className="bg-secondary/50 border border-border p-4 rounded-2xl mb-8 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total Price</span>
                <span className="text-xl font-semibold text-foreground">₹{qty > 0 ? (defaultVar.discount_price || defaultVar.price) * qty : (defaultVar.discount_price || defaultVar.price)}</span>
              </div>
              
              {qty === 0 ? (
                <button 
                  onClick={() => {
                    if (product.variations && product.variations.length > 1) {
                      setShowVariationModal(true);
                    } else {
                      addItem({ 
                        product_id: product.id, 
                        variation_id: defaultVar.id,
                        user_id: product.user_id
                      });
                    }
                  }}
                  className="flex-1 md:flex-none h-12 px-10 bg-primary text-white font-semibold text-lg rounded-xl shadow-primary hover:bg-primary/90 transition-all active:scale-95"
                >
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center gap-4 bg-white border border-border p-1.5 rounded-xl">
                    <button onClick={() => {
                      removeItem(product.id, defaultVar.id);
                    }} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors">
                      <Icon name="MinusIcon" size={18} />
                    </button>
                    <span className="text-lg font-semibold text-foreground w-6 text-center">{qty}</span>
                    <button
                      onClick={() => {
                        if (product.variations && product.variations.length > 1) {
                          setShowVariationModal(true);
                        } else {
                          addItem({ 
                            product_id: product.id, 
                            variation_id: defaultVar.id,
                            user_id: product.user_id
                          });
                        }
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-white transition-colors"
                    >
                      <Icon name="PlusIcon" size={18} />
                    </button>
                  </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-foreground uppercase tracking-widest mb-2 border-l-4 border-primary pl-3">Product Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                   {product.description || "No description available for this product."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-card border border-border rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="CheckCircleIcon" size={16} className="text-success" />
                    <span className="text-xs font-semibold text-foreground">Quality Assured</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Passed all safety & freshness checks.</p>
                </div>
                <div className="p-3 bg-card border border-border rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="ClockIcon" size={16} className="text-primary" />
                    <span className="text-xs font-semibold text-foreground">{product.delivery_time || "10 min"} Delivery</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Delivered fresh within minutes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nutritional Info Section */}
        {/* <section className="mt-12 pt-12 border-t border-border">
          <h3 className="text-2xl font-semibold text-foreground mb-6">Nutritional Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Energy', value: '45 kcal' },
              { label: 'Protein', value: '1.2 g' },
              { label: 'Carbohydrates', value: '9.8 g' },
              { label: 'Fat', value: '0.2 g' },
            ].map(item => (
              <div key={item.label} className="bg-muted/50 p-4 rounded-2xl flex flex-col items-center text-center">
                <span className="text-base font-semibold text-foreground">{item.value}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-muted-foreground italic">* Nutritional values are approximate per 100g serving.</p>
        </section> */}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground">You Might Also Like</h3>
              <Link to="/product-listing" className="text-base font-semibold text-primary hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedProducts.map(p => {
                const pVar = p.variations?.[0] || {};
                const pPath = `/${p.category_slug}/${p.subcategory_slug}/${p.slug}`;
                return (
                  <Link key={p.id} to={pPath} className="group">
                    <div className="bg-white border border-border rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-card group-hover:-translate-y-1 h-full flex flex-col">
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px]">No Img</div>
                        )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <p className="text-[10px] text-muted-foreground font-bold mb-0.5">{pVar.label}</p>
                        <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <span className="text-sm font-black text-foreground">₹{pVar.discount_price || pVar.price}</span>
                          <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                            <Icon name="PlusIcon" size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav active="none" />
      </div>
    </div>
      
      {/* Variation Selection Modal */}
      {product && (
        <VariationSelectionModal
          isOpen={showVariationModal}
          onClose={() => setShowVariationModal(false)}
          product={{
            id: product.id,
            name: product.name,
            image: product.thumbnail,
            user_id: product.user_id,
            variations: product.variations || []
          }}
        />
      )}
    </>
  );
}
