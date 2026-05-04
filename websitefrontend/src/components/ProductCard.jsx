import { useState } from 'react';
import { FiPlus, FiMinus, FiHeart, FiStar } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const [qty, setQty] = useState(0);
  const [wished, setWished] = useState(false);

  const discountPct = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div
      id={`product-card-${product.id}`}
      className="card flex flex-col relative overflow-hidden group"
      style={{ padding: 'var(--card-p)' }}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
        {discountPct && (
          <span className="badge-discount">{discountPct}%</span>
        )}
        {product.tag && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ background: product.tag === 'ORGANIC' ? 'var(--secondary)' : 'var(--primary)' }}
          >
            {product.tag}
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        id={`product-wish-${product.id}`}
        onClick={() => setWished(w => !w)}
        className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          background: wished ? '#FFE8E8' : 'white',
          color: wished ? 'var(--accent)' : 'var(--text-muted)',
          boxShadow: 'var(--shadow-sm)',
        }}
        title="Add to Wishlist"
      >
        <FiHeart size={14} fill={wished ? 'currentColor' : 'none'} />
      </button>

      {/* Image area */}
      <div
        className="rounded-xl mb-3 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105"
        style={{ background: 'var(--bg)', height: '150px' }}
      >
        <span style={{ fontSize: '5rem', lineHeight: 1 }}>{product.emoji}</span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-1">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            size={11}
            fill={i < Math.floor(product.rating ?? 4) ? '#FDCB6E' : 'none'}
            stroke={i < Math.floor(product.rating ?? 4) ? '#FDCB6E' : 'var(--text-muted)'}
          />
        ))}
        <span className="text-[10px] ml-1" style={{ color: 'var(--text-muted)' }}>
          ({product.reviews ?? 3})
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-xs font-semibold leading-snug mb-2 line-clamp-2 flex-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {product.name}
      </h3>

      {/* Price row */}
      <div className="flex items-center justify-between mt-auto">
        <div>
          <span className="font-bold text-base" style={{ color: 'var(--primary)' }}>
            ${product.price.toFixed(2)}
          </span>
          {product.oldPrice && (
            <span className="text-xs line-through ml-1.5" style={{ color: 'var(--text-muted)' }}>
              ${product.oldPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to cart control */}
        {qty === 0 ? (
          <button
            className="add-btn"
            id={`product-add-${product.id}`}
            onClick={() => setQty(1)}
            title="Add to cart"
          >
            <FiPlus size={16} />
          </button>
        ) : (
          <div
            className="flex items-center gap-1.5 rounded-full px-1.5 py-0.5"
            style={{ background: 'var(--primary-light)' }}
          >
            <button
              className="w-6 h-6 rounded-full flex items-center justify-center text-white transition-all"
              style={{ background: 'var(--primary)', fontSize: '14px' }}
              id={`product-minus-${product.id}`}
              onClick={() => setQty(q => Math.max(0, q - 1))}
            >
              <FiMinus size={12} />
            </button>
            <span className="text-xs font-bold w-5 text-center" style={{ color: 'var(--primary)' }}>
              {qty}
            </span>
            <button
              className="w-6 h-6 rounded-full flex items-center justify-center text-white transition-all"
              style={{ background: 'var(--primary)', fontSize: '14px' }}
              id={`product-plus-${product.id}`}
              onClick={() => setQty(q => q + 1)}
            >
              <FiPlus size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Stock warning */}
      {product.stock && (
        <div className="mt-2.5">
          <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Available only: <strong style={{ color: 'var(--accent)' }}>{product.stock}</strong></span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min((product.stock / 50) * 100, 100)}%`,
                background: product.stock < 20
                  ? 'var(--accent)'
                  : 'var(--secondary)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
