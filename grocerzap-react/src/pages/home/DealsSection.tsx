

import React from 'react';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';

const deals = [
  {
    id: 'd1',
    name: 'Basmati Rice Premium',
    weight: '5 kg',
    price: 349,
    originalPrice: 499,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
    discount: 30,
    timeLeft: '08h 24m',
  },
  {
    id: 'd2',
    name: 'Mixed Fruit Basket',
    weight: '2 kg',
    price: 199,
    originalPrice: 299,
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
    discount: 33,
    timeLeft: '08h 24m',
  },
  {
    id: 'd3',
    name: 'Amul Butter',
    weight: '500 g',
    price: 245,
    originalPrice: 280,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
    discount: 12,
    timeLeft: '08h 24m',
  },
];

export default function DealsSection() {
  const { addItem, removeItem, getItemQty } = useCart();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {deals?.map((deal) => {
        const qty = getItemQty(deal?.id);
        return (
          <div
            key={deal?.id}
            className="bg-card border border-border rounded-2xl flex items-center gap-3 p-3 shadow-card hover:shadow-card-hover transition-all duration-200"
          >
            {/* Image */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
              <img src={deal?.image} alt={deal?.name} className="w-full h-full object-cover" />
              <div className="absolute top-1 left-1 bg-danger text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                -{deal?.discount}%
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground font-medium">{deal?.weight}</p>
              <p className="text-sm font-semibold text-foreground leading-tight truncate">{deal?.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-base font-bold text-foreground">₹{deal?.price}</span>
                <span className="text-xs text-muted-foreground line-through">₹{deal?.originalPrice}</span>
                <span className="text-[10px] font-bold text-success">Save ₹{deal?.originalPrice - deal?.price}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Icon name="ClockIcon" size={11} className="text-accent" />
                <span className="text-[10px] font-medium text-accent">Ends in {deal?.timeLeft}</span>
              </div>
            </div>
            {/* Add button */}
            <div className="flex-shrink-0">
              {qty === 0 ? (
                <button
                  onClick={() => addItem({ id: deal?.id, name: deal?.name, price: deal?.price, image: deal?.image, weight: deal?.weight })}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-lg font-bold transition-all duration-200 active:scale-90 hover:bg-primary/90"
                >
                  +
                </button>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => addItem({ id: deal?.id, name: deal?.name, price: deal?.price, image: deal?.image, weight: deal?.weight })} className="qty-btn bg-primary text-white border-primary">+</button>
                  <span className="text-xs font-bold text-foreground">{qty}</span>
                  <button onClick={() => removeItem(deal?.id)} className="qty-btn">−</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
