import { useState, useEffect } from 'react';
import { FiArrowRight, FiShoppingBag } from 'react-icons/fi';

const slides = [
  {
    id: 1,
    badge: '🛒 Weekend Discount',
    title: 'Get the best quality products at the lowest prices',
    subtitle: 'We have prepared special discounts for you on organic breakfast products.',
    price: '$21.67',
    oldPrice: '$59.99',
    cta: 'Shop Now',
    ctaNote: "Don't miss this limited time offer.",
    bg: 'linear-gradient(135deg, #F8F7FF 0%, #EDE9FF 60%, #D5CCFF 100%)',
    emoji: '🥗',
    accent: 'var(--primary)',
    items: [
      { emoji: '🥣', label: 'Granola', top: '10%', right: '28%', size: '4.5rem' },
      { emoji: '🫐', label: 'Blueberry', top: '60%', right: '38%', size: '3.5rem' },
      { emoji: '🥛', label: 'Milk', top: '20%', right: '12%', size: '5rem' },
      { emoji: '🍓', label: 'Strawberry', top: '65%', right: '14%', size: '4rem' },
    ],
  },
  {
    id: 2,
    badge: '⚡ Flash Sale',
    title: 'Fresh fruits & vegetables delivered in 10 minutes',
    subtitle: 'From farm to your table. Hand-picked, premium quality produce every day.',
    price: '$14.99',
    oldPrice: '$34.99',
    cta: 'Order Now',
    ctaNote: 'Free delivery on orders over $25',
    bg: 'linear-gradient(135deg, #F0FFF8 0%, #C8F7E5 60%, #A0F0D0 100%)',
    emoji: '🥦',
    accent: 'var(--secondary)',
    items: [
      { emoji: '🥑', label: 'Avocado', top: '10%', right: '28%', size: '5rem' },
      { emoji: '🍅', label: 'Tomato', top: '60%', right: '38%', size: '4rem' },
      { emoji: '🥕', label: 'Carrot', top: '15%', right: '10%', size: '5.5rem' },
      { emoji: '🥬', label: 'Greens', top: '62%', right: '12%', size: '4.5rem' },
    ],
  },
  {
    id: 3,
    badge: '🔥 Hot Deals',
    title: 'Premium snacks & beverages for every occasion',
    subtitle: 'Explore thousands of products from top brands at unbeatable prices.',
    price: '$8.50',
    oldPrice: '$19.99',
    cta: 'Explore All',
    ctaNote: 'New deals added every hour',
    bg: 'linear-gradient(135deg, #FFF7F0 0%, #FFE5CC 60%, #FFCFA0 100%)',
    emoji: '🧃',
    accent: 'var(--accent-orange)',
    items: [
      { emoji: '🧁', label: 'Cupcake', top: '10%', right: '28%', size: '5rem' },
      { emoji: '🍫', label: 'Chocolate', top: '60%', right: '36%', size: '4rem' },
      { emoji: '🥤', label: 'Beverage', top: '15%', right: '10%', size: '5.5rem' },
      { emoji: '🍿', label: 'Popcorn', top: '62%', right: '12%', size: '4rem' },
    ],
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = slides[current];

  return (
    <section id="hero" className="relative overflow-hidden" style={{ minHeight: '480px' }}>
      <div
        className="transition-all duration-700"
        style={{ background: slide.bg, minHeight: '480px' }}
      >
        <div className="container-main h-full flex items-center" style={{ minHeight: '480px' }}>
          {/* Left content */}
          <div className="flex-1 py-16 md:py-20 pr-4 z-10 relative">
            {/* Badge */}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{
                background: 'white',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {slide.badge}
            </span>

            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
              style={{ color: 'var(--text-primary)', maxWidth: '480px' }}
            >
              {slide.title}
            </h1>
            <p
              className="text-sm md:text-base mb-8"
              style={{ color: 'var(--text-secondary)', maxWidth: '380px' }}
            >
              {slide.subtitle}
            </p>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="text-3xl font-bold"
                style={{ color: slide.accent }}
              >
                {slide.price}
              </span>
              <span
                className="text-lg line-through"
                style={{ color: 'var(--text-muted)' }}
              >
                {slide.oldPrice}
              </span>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                className="btn-primary text-base px-7 py-3"
                id={`hero-cta-${current}`}
                style={{ background: slide.accent }}
              >
                <FiShoppingBag size={18} />
                {slide.cta}
              </button>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {slide.ctaNote}
              </p>
            </div>
          </div>

          {/* Right: floating emoji items */}
          <div className="hidden md:block flex-1 relative" style={{ minHeight: '420px' }}>
            {slide.items.map((item, i) => (
              <div
                key={i}
                className="absolute select-none"
                style={{
                  top: item.top,
                  right: item.right,
                  fontSize: item.size,
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                  filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.12))',
                }}
                title={item.label}
              >
                {item.emoji}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            id={`hero-dot-${i}`}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? '24px' : '8px',
              height: '8px',
              background: i === current ? 'var(--primary)' : 'var(--border)',
            }}
          />
        ))}
      </div>
    </section>
  );
}
