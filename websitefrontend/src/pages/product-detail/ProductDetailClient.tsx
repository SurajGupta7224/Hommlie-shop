
import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';

// Mock data base (should ideally come from a shared data file or API)
const allProducts = [
  { id: 'g1', name: 'Amul Taaza Milk', weight: '1 L', price: 62, originalPrice: 68, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80', rating: 4.8, reviews: 124, category: 'Dairy', badge: 'Bestseller', description: 'Fresh and pure milk from Amul, processed with advanced technology to ensure long-lasting freshness and nutrition.' },
  { id: 'g2', name: 'Fresh Tomatoes', weight: '500 g', price: 28, originalPrice: 35, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80', rating: 4.5, reviews: 86, category: 'Vegetables', badge: 'Fresh', description: 'Farm-fresh, juicy red tomatoes. Rich in Vitamin C and Lycopene, perfect for salads, curries, and sauces.' },
  { id: 'g3', name: "Lay's Classic Salted", weight: '90 g', price: 20, originalPrice: 20, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&q=80', rating: 4.7, reviews: 342, category: 'Snacks', badge: null, description: 'The classic salted potato chips from Lay\'s. Crispy, thin, and perfectly seasoned for the ultimate snacking experience.' },
  { id: 'g4', name: 'Britannia Brown Bread', weight: '400 g', price: 45, originalPrice: 50, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80', rating: 4.4, reviews: 56, category: 'Bakery', badge: null, description: 'Healthy and fiber-rich whole wheat brown bread from Britannia. Ideal for a nutritious breakfast or sandwiches.' },
  { id: 'g5', name: 'Tropicana Orange Juice', weight: '1 L', price: 99, originalPrice: 120, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80', rating: 4.6, reviews: 98, category: 'Beverages', badge: '17% off', description: '100% pure orange juice from Tropicana. No added sugar or preservatives. Packed with the goodness of real oranges.' },
  { id: 'g6', name: 'Royal Gala Apples', weight: '1 kg', price: 149, originalPrice: 180, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80', rating: 4.5, reviews: 112, category: 'Fruits', badge: 'Organic', description: 'Sweet and crunchy Royal Gala apples. Sourced from the finest orchards, rich in antioxidants and dietary fiber.' },
  { id: 'g7', name: 'Paneer Fresh', weight: '200 g', price: 85, originalPrice: 95, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80', rating: 4.7, reviews: 74, category: 'Dairy', badge: null, description: 'Soft and creamy fresh paneer. Made from pure milk, perfect for making your favorite Indian dishes like Palak Paneer or Matar Paneer.' },
  { id: 'g8', name: 'Baby Spinach', weight: '250 g', price: 39, originalPrice: 45, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80', rating: 4.3, reviews: 45, category: 'Vegetables', badge: 'Fresh', description: 'Tender and nutritious baby spinach leaves. Pre-washed and ready to use in salads, smoothies, or sautés.' },
  { id: 'g9', name: 'Kurkure Masala Munch', weight: '80 g', price: 20, originalPrice: 20, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80', rating: 4.5, reviews: 215, category: 'Snacks', badge: null, description: 'The famous spicy and crunchy Masala Munch from Kurkure. Made with dal, corn, and rice for a unique Indian taste.' },
  { id: 'g10', name: 'Alphonso Mangoes', weight: '1 kg', price: 299, originalPrice: 350, image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80', rating: 4.9, reviews: 180, category: 'Fruits', badge: 'Premium', description: 'The king of mangoes - Ratnagiri Alphonso. Known for its rich aroma, golden yellow texture, and incomparable sweetness.' },
  { id: 'g11', name: 'Amul Butter', weight: '500 g', price: 245, originalPrice: 280, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&q=80', rating: 4.8, reviews: 156, category: 'Dairy', badge: null, description: 'Utterly Butterly Delicious Amul Butter. A household staple in India, perfect for spreading on bread or cooking.' },
  { id: 'g12', name: 'Whole Wheat Atta', weight: '5 kg', price: 220, originalPrice: 260, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80', rating: 4.6, reviews: 89, category: 'Bakery', badge: '15% off', description: 'Superior quality whole wheat atta. Ground using traditional stone-grinding process to retain the natural goodness of wheat.' },
];

export default function ProductDetailClient() {
  const { id } = useParams();
  const { addItem, removeItem, getItemQty } = useCart();
  
  const product = useMemo(() => allProducts.find(p => p.id === id) || allProducts[0], [id]);
  const qty = getItemQty(product.id);
  
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header title={product.name} showBack={true} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left: Image Showcase */}
          <div className="relative aspect-square md:aspect-auto md:h-[500px] bg-white rounded-3xl overflow-hidden shadow-sm border border-border group">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-4 right-4 bg-success text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 bg-accent/10 text-accent px-2 py-0.5 rounded-lg">
                  <Icon name="StarIcon" size={14} className="text-accent" variant="solid" />
                  <span className="text-xs font-bold">{product.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-1 leading-tight">{product.name}</h2>
              <p className="text-xl font-medium text-muted-foreground">{product.weight}</p>
            </div>

            <div className="flex items-end gap-3 mb-8">
              <span className="text-4xl font-semibold text-foreground">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <div className="flex flex-col mb-1">
                  <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">₹{product.originalPrice}</span>
                  <span className="text-xs font-semibold text-success uppercase">Save ₹{product.originalPrice - product.price}</span>
                </div>
              )}
            </div>

            {/* Action Area */}
            <div className="bg-secondary/50 border border-border p-4 rounded-2xl mb-8 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total Price</span>
                <span className="text-xl font-semibold text-foreground">₹{qty > 0 ? product.price * qty : product.price}</span>
              </div>
              
              {qty === 0 ? (
                <button 
                  onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image, weight: product.weight })}
                  className="flex-1 md:flex-none h-12 px-10 bg-primary text-white font-semibold text-lg rounded-xl shadow-primary hover:bg-primary/90 transition-all active:scale-95"
                >
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center gap-4 bg-white border border-border p-1.5 rounded-xl">
                  <button onClick={() => removeItem(product.id)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors">
                    <Icon name="MinusIcon" size={18} />
                  </button>
                  <span className="text-lg font-semibold text-foreground w-6 text-center">{qty}</span>
                  <button onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image, weight: product.weight })} className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-white transition-colors">
                    <Icon name="PlusIcon" size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Information Tabs/Accordion Style */}
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-foreground uppercase tracking-widest mb-2 border-l-4 border-primary pl-3">Product Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
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
                    <span className="text-xs font-semibold text-foreground">10 Min Delivery</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Delivered fresh within minutes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nutritional Info Section */}
        <section className="mt-12 pt-12 border-t border-border">
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
        </section>

        {/* Related Products */}
        <section className="mt-16 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-foreground">You Might Also Like</h3>
            <Link to="/product-listing" className="text-base font-semibold text-primary hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {allProducts.slice(0, 6).map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="group">
                <div className="bg-white border border-border rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-card group-hover:-translate-y-1">
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-muted-foreground font-bold mb-0.5">{p.weight}</p>
                    <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-black text-foreground">₹{p.price}</span>
                      <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <Icon name="PlusIcon" size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav active="none" />
      </div>
    </div>
  );
}
