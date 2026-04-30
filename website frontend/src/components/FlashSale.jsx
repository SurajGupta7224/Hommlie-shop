import { useState, useEffect } from 'react';
import { FiZap } from 'react-icons/fi';
import ProductCard from './ProductCard';

// Flash sale items with bigger discounts
const flashProducts = [
  { id: 21, name: 'Organic Peanut Butter Creamy 16oz', emoji: '🥜', price: 2.99, oldPrice: 7.99, tag: 'ORGANIC', rating: 5, reviews: 24, stock: 8 },
  { id: 22, name: 'Premium Olive Oil Extra Virgin 1L', emoji: '🫒', price: 6.49, oldPrice: 14.99, rating: 5, reviews: 31, stock: 5 },
  { id: 23, name: 'Wild Caught Salmon Fillet 500g', emoji: '🐟', price: 7.99, oldPrice: 16.99, rating: 5, reviews: 17, stock: 10 },
  { id: 24, name: 'Artisan Dark Chocolate 85% 200g', emoji: '🍫', price: 2.50, oldPrice: 5.99, rating: 4, reviews: 41, stock: 14 },
  { id: 25, name: 'Cold Brew Coffee Concentrate 32oz', emoji: '☕', price: 4.99, oldPrice: 10.49, tag: 'COLD SALE', rating: 5, reviews: 29, stock: 7 },
  { id: 26, name: 'Kombucha Mixed Berry 6-Pack', emoji: '🫙', price: 8.25, oldPrice: 17.99, rating: 4, reviews: 13, stock: 11 },
  { id: 27, name: 'Grass-Fed Butter Unsalted 8oz', emoji: '🧈', price: 3.49, oldPrice: 6.99, tag: 'ORGANIC', rating: 5, reviews: 38, stock: 6 },
  { id: 28, name: 'Protein Granola Bar Variety 12-Pack', emoji: '🍫', price: 9.99, oldPrice: 19.99, rating: 4, reviews: 55, stock: 20 },
];

function Digit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[9px] uppercase tracking-widest mt-1 opacity-70 text-white">{label}</span>
    </div>
  );
}

export default function FlashSale() {
  // 4 h 59 min countdown
  const [time, setTime] = useState({ h: 4, m: 59, s: 47 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      id="flash-sale"
      className="py-14"
      style={{ background: 'var(--bg-white)' }}
    >
      <div className="container-main">
        {/* Header with countdown */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl p-5 mb-8"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #9B8BFF 100%)' }}
        >
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
              <FiZap size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">⚡ Flash Sale</p>
              <p className="text-xs opacity-80">Ends at midnight — grab it before it's gone!</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <Digit value={time.h} label="Hours" />
            <span className="text-white font-bold text-xl mb-4">:</span>
            <Digit value={time.m} label="Mins" />
            <span className="text-white font-bold text-xl mb-4">:</span>
            <Digit value={time.s} label="Secs" />
          </div>

          <a
            href="#"
            id="flash-sale-view-all"
            className="text-white text-sm font-bold border border-white border-opacity-40 rounded-full px-5 py-2 hover:bg-white hover:text-purple-600 transition-all"
          >
            View All →
          </a>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {flashProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
