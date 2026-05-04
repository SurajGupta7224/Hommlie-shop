'use client';

import React from 'react';

import ProductCardSmall from './ProductCardSmall';

export const bestSellersData = [
  {
    id: 'p1',
    name: 'Amul Taaza Milk',
    weight: '1 L',
    price: 62,
    originalPrice: 68,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80',
    rating: 4.8,
    category: 'Dairy',
    badge: 'Bestseller',
  },
  {
    id: 'p2',
    name: 'Fresh Tomatoes',
    weight: '500 g',
    price: 28,
    originalPrice: 35,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&q=80',
    rating: 4.5,
    category: 'Vegetables',
    badge: 'Fresh',
  },
  {
    id: 'p3',
    name: 'Lay\'s Classic Salted',
    weight: '90 g',
    price: 20,
    originalPrice: 20,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&q=80',
    rating: 4.7,
    category: 'Snacks',
    badge: null,
  },
  {
    id: 'p4',
    name: 'Britannia Brown Bread',
    weight: '400 g',
    price: 45,
    originalPrice: 50,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80',
    rating: 4.4,
    category: 'Bakery',
    badge: '10% off',
  },
  {
    id: 'p5',
    name: 'Tropicana Orange',
    weight: '1 L',
    price: 99,
    originalPrice: 120,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&q=80',
    rating: 4.6,
    category: 'Beverages',
    badge: '17% off',
  },
];

export default function BestSellers() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {bestSellersData?.map((product) => (
        <ProductCardSmall key={product?.id} product={product} />
      ))}
    </div>
  );
}