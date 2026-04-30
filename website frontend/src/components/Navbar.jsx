import { useState, useEffect } from 'react';
import {
  FiShoppingCart as ShoppingCart,
  FiUser as User,
  FiSearch as Search,
  FiMapPin as MapPin
} from "react-icons/fi";

const Navbar = () => {
  return (
    <div className="w-full shadow-sm bg-white">

      {/* TOP NAVBAR */}
      <div className="flex items-center justify-between px-6 py-3">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-6">

          {/* LOGO */}
          <h1 className="text-3xl font-bold text-purple-600">
            zepto
          </h1>

          {/* LOCATION */}
          <div className="flex items-center gap-1 text-gray-700 cursor-pointer">
            <MapPin size={18} />
            <span className="font-medium">Select Location</span>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="flex items-center w-[50%] bg-gray-100 px-4 py-2 rounded-lg">
          <Search className="text-gray-500" size={18} />
          <input
            type="text"
            placeholder='Search for "cheese slices"'
            className="bg-transparent outline-none w-full px-2 text-sm"
          />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-6">

          {/* LOGIN */}
          <div className="flex flex-col items-center text-sm cursor-pointer">
            <User size={22} />
            <span>Login</span>
          </div>

          {/* CART */}
          <div className="relative flex flex-col items-center text-sm cursor-pointer">
            <ShoppingCart size={22} />
            <span>Cart</span>

            {/* BADGE */}
            <span className="absolute -top-1 right-1 bg-purple-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              1
            </span>
          </div>
        </div>
      </div>

      {/* CATEGORY NAVBAR */}
      <div className="flex items-center gap-8 px-6 py-3 border-t text-gray-600 overflow-x-auto">

        {[
          "All",
          "Cafe",
          "Home",
          "Toys",
          "Fresh",
          "Electronics",
          "Mobiles",
          "Beauty",
          "Fashion",
        ].map((item, index) => (
          <button
            key={index}
            className={`flex items-center gap-2 pb-2 whitespace-nowrap ${item === "All"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "hover:text-purple-600"
              }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navbar;