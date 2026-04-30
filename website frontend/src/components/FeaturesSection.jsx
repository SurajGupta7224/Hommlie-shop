const features = [
  {
    id: 'feature-payment',
    emoji: '💳',
    title: 'Payment only online',
    desc: 'Safe & secure digital payments with all major cards and wallets accepted.',
    color: '#E3F2FD',
    accent: '#2196F3',
  },
  {
    id: 'feature-stocks',
    emoji: '📦',
    title: 'New stocks and sales',
    desc: 'Fresh stock updates daily with exclusive member-only sale prices.',
    color: '#FFF3E0',
    accent: '#FF9800',
  },
  {
    id: 'feature-quality',
    emoji: '✅',
    title: 'Quality assurance',
    desc: 'Every product is quality-checked before it reaches your doorstep.',
    color: '#E8F5E9',
    accent: '#4CAF50',
  },
  {
    id: 'feature-delivery',
    emoji: '🚀',
    title: 'Delivery from 1 hour',
    desc: 'Ultra-fast delivery straight to your door in as little as 60 minutes.',
    color: '#F3E5F5',
    accent: '#9C27B0',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-14" style={{ background: 'var(--bg)' }}>
      <div className="container-main">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="section-title">Why Choose Us?</h2>
          <p className="section-subtitle mt-2">Everything you need for a seamless grocery experience</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(f => (
            <div
              key={f.id}
              id={f.id}
              className="flex flex-col items-center text-center p-6 rounded-2xl border transition-all duration-300 group"
              style={{
                background: f.color,
                border: '1.5px solid transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = f.accent;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${f.accent}25`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'white', boxShadow: `0 4px 12px ${f.accent}30` }}
              >
                {f.emoji}
              </div>
              <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                {f.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
