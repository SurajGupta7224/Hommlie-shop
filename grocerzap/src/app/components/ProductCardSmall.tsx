'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';

interface Product {
  id: string;
  name: string;
  weight: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  category: string;
  badge: string | null;
}

export default function ProductCardSmall({ product }: { product: Product }) {
  const { addItem, removeItem, getItemQty } = useCart();
  const qty = getItemQty(product.id);
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card w-full flex flex-col">
      {/* Image */}
      <div className="relative h-28 bg-muted overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.badge && (
          <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-success text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 flex flex-col flex-1">
        <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{product.weight}</p>
        <p className="text-xs font-semibold text-foreground leading-tight mb-1 line-clamp-2">{product.name}</p>

        {/* Rating */}
        <div className="flex items-center gap-0.5 mb-2">
          <Icon name="StarIcon" size={10} className="text-accent" variant="solid" />
          <span className="text-[10px] font-semibold text-foreground">{product.rating}</span>
        </div>

        {/* Price + Add */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-sm font-bold text-foreground">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] text-muted-foreground line-through ml-1">₹{product.originalPrice}</span>
            )}
          </div>

          {qty === 0 ? (
            <button
              onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image, weight: product.weight })}
              className="add-btn w-7 h-7 text-base"
            >
              +
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={() => removeItem(product.id)} className="qty-btn">−</button>
              <span className="text-xs font-bold text-foreground w-4 text-center">{qty}</span>
              <button onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image, weight: product.weight })} className="qty-btn bg-primary text-white border-primary hover:bg-primary/80">+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}