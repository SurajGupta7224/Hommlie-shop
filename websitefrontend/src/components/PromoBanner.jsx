import { FiArrowRight } from 'react-icons/fi';

// Single horizontal promotional strip (health & safety)
export function PromoBanner() {
  return (
    <section id="promo-strip" className="py-3" style={{ background: '#FFF8E1' }}>
      <div className="container-main flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="text-4xl font-black" style={{ color: '#FDCB6E', opacity: 0.4 }}>
            %50
          </span>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              In store or online your health &amp; safety is our top priority
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              The only supermarket that makes your life easier, makes you enjoy life and makes it better
            </p>
          </div>
        </div>
        <button className="btn-outline shrink-0" id="promo-strip-cta">
          Shop Now <FiArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

// Three promotional cards
const promoCards = [
  {
    id: 'promo-card-1',
    label: 'Only This Week',
    title: 'We provide you the best quality products',
    note: 'Only this week. Don\'t miss...',
    emoji: '🍓',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cta: 'Shop Now',
  },
  {
    id: 'promo-card-2',
    label: 'Only This Week',
    title: 'We make your grocery shopping more exciting',
    note: 'Feed your family the best',
    emoji: '🍋',
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    cta: 'Shop Now',
  },
  {
    id: 'promo-card-3',
    label: 'Only This Week',
    title: 'The one supermarket that saves your money',
    note: 'Eat one every day',
    emoji: '🍞',
    bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    cta: 'Shop Now',
  },
];

export function PromoCards() {
  return (
    <section id="promo-cards" className="py-14" style={{ background: 'var(--bg-white)' }}>
      <div className="container-main grid grid-cols-1 sm:grid-cols-3 gap-5">
        {promoCards.map(card => (
          <div
            key={card.id}
            id={card.id}
            className="relative rounded-2xl overflow-hidden flex items-center justify-between p-6 min-h-[160px] group cursor-pointer"
            style={{ background: card.bg }}
          >
            {/* Text */}
            <div className="z-10 flex-1 pr-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white opacity-80 mb-2 block">
                {card.label}
              </span>
              <h3 className="text-white font-bold text-sm leading-snug mb-3">
                {card.title}
              </h3>
              <p className="text-white text-[11px] opacity-70 mb-4">{card.note}</p>
              <button
                className="text-white text-xs font-semibold flex items-center gap-1.5 group-hover:gap-3 transition-all"
                id={`${card.id}-cta`}
              >
                {card.cta} <FiArrowRight size={14} />
              </button>
            </div>
            {/* Emoji */}
            <div
              className="text-6xl flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
              style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))' }}
            >
              {card.emoji}
            </div>
            {/* Decorative circle */}
            <div
              className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-20"
              style={{ background: 'white' }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
