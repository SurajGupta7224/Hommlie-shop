

import React, { useState, useEffect } from 'react';

const banners = [
{
  id: 1,
  title: 'Fresh Fruits & Veggies',
  subtitle: 'Up to 40% off today',
  badge: 'MEGA SALE',
  gradient: 'from-[#7C3AED] to-[#5B21B6]',
  image: "https://images.unsplash.com/photo-1615714880989-1b48c82d8f45",
  badgeColor: 'bg-accent'
},
{
  id: 2,
  title: 'Dairy Essentials',
  subtitle: 'Free delivery on ₹199+',
  badge: 'FREE DELIVERY',
  gradient: 'from-[#059669] to-[#047857]',
  image: "https://images.unsplash.com/photo-1670400122475-45b7e3437bdb",
  badgeColor: 'bg-white/20'
},
{
  id: 3,
  title: 'Snacks & Beverages',
  subtitle: 'Buy 2 Get 1 Free',
  badge: 'B2G1 FREE',
  gradient: 'from-[#DC2626] to-[#B91C1C]',
  image: "https://images.unsplash.com/photo-1707380658495-13ee3d17a7de",
  badgeColor: 'bg-accent'
}];


export default function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners?.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl h-36 md:h-52">
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}>
        
        {banners?.map((banner) =>
        <div
          key={banner?.id}
          className={`min-w-full h-full bg-gradient-to-r ${banner?.gradient} relative flex items-center overflow-hidden cursor-pointer`}>
          
            {/* Background image */}
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-30">
              <img
              src={banner?.image}
              alt={banner?.title}
              className="w-full h-full object-cover" />
            
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/60" />
            </div>

            {/* Content */}
            <div className="relative z-10 px-5 py-4">
              <span className={`inline-block ${banner?.badgeColor} text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2`}>
                {banner?.badge}
              </span>
              <h3 className="text-white font-bold text-lg leading-tight">{banner?.title}</h3>
              <p className="text-white/80 text-sm font-medium">{banner?.subtitle}</p>
            </div>
          </div>
        )}
      </div>
      {/* Dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners?.map((_, i) =>
        <button
          key={i}
          onClick={() => setCurrent(i)}
          className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />

        )}
      </div>
    </div>);

}
