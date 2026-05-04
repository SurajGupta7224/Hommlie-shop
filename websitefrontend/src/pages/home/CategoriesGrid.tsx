

import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Fruits', emoji: '🍎', color: 'bg-red-50', border: 'border-red-100' },
  { name: 'Vegetables', emoji: '🥦', color: 'bg-green-50', border: 'border-green-100' },
  { name: 'Dairy', emoji: '🥛', color: 'bg-blue-50', border: 'border-blue-100' },
  { name: 'Snacks', emoji: '🍿', color: 'bg-yellow-50', border: 'border-yellow-100' },
  { name: 'Beverages', emoji: '🧃', color: 'bg-orange-50', border: 'border-orange-100' },
  { name: 'Bakery', emoji: '🍞', color: 'bg-amber-50', border: 'border-amber-100' },
  { name: 'Meat', emoji: '🥩', color: 'bg-rose-50', border: 'border-rose-100' },
  { name: 'Household', emoji: '🧹', color: 'bg-purple-50', border: 'border-purple-100' },
];

export default function CategoriesGrid() {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {categories?.map((cat) => (
        <Link key={cat?.name} to="/product-listing">
          <div className={`${cat?.color} ${cat?.border} border rounded-2xl flex flex-col items-center justify-center py-3 px-1 gap-1.5 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95`}>
            <span className="text-2xl">{cat?.emoji}</span>
            <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{cat?.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
