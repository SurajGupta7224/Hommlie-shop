import { X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

interface Variation {
  id: number;
  name: string;
  sku: string;
  unit: string | null;
  weight: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  image: string | null;
  variations: Variation[];
}

interface VariationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function VariationSelectionModal({ isOpen, onClose, product }: VariationSelectionModalProps) {
  const { addItem } = useCart();

  const handleAddToCart = async (variation: Variation) => {
    if (variation.stock <= 0) {
      toast.error('This variation is out of stock');
      return;
    }

    try {
      await addItem({
        product_id: product.id,
        variation_id: variation.id
      });
      onClose();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const formatPrice = (price: number, discountPrice: number | null) => {
    if (discountPrice && discountPrice < price) {
      const discount = Math.round(((price - discountPrice) / price) * 100);
      return (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-gray-900">₹{discountPrice}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">₹{price}</span>
            <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              {discount}% off
            </span>
          </div>
        </div>
      );
    }
    return <span className="text-xl font-bold text-gray-900">₹{price}</span>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out scale-100">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={product.image || 'https://via.placeholder.com/400'} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Select Variation</h2>
                <p className="text-xs md:text-sm text-gray-600">{product.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Variations List */}
        <div className="overflow-y-auto max-h-[60vh]">
          <div className="p-3 md:p-4 space-y-3">
            {product.variations.map((variation) => {
              const isOutOfStock = variation.stock <= 0;
              
              return (
                <div
                  key={variation.id}
                  className={`border rounded-lg p-3 md:p-4 transition-all cursor-pointer ${
                    isOutOfStock 
                      ? 'border-gray-200 bg-gray-50 opacity-60' 
                      : 'border-gray-200 hover:border-blue-500 hover:shadow-md bg-white'
                  }`}
                  onClick={() => !isOutOfStock && handleAddToCart(variation)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Left Side - Variation Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 text-sm md:text-base">
                          {variation.name}
                        </h3>
                        {variation.unit && (
                          <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded border border-blue-200">
                            {variation.unit}
                          </span>
                        )}
                        {variation.weight && (
                          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                            {variation.weight}
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="bg-red-50 text-red-700 text-xs font-medium px-2 py-1 rounded border border-red-200">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      
                      {/* SKU and Stock */}
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-xs text-gray-500 font-mono">
                          SKU: {variation.sku || 'N/A'}
                        </span>
                        {!isOutOfStock && (
                          <span className="text-xs text-green-600 font-medium">
                            {variation.stock > 10 ? 'In Stock' : `Only ${variation.stock} left`}
                          </span>
                        )}
                      </div>
                      
                      {/* Stock Warning */}
                      {variation.stock <= 5 && variation.stock > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-3">
                          <p className="text-xs text-orange-700 font-medium">
                            ⚠️ Only {variation.stock} items left in stock!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Side - Price and Action */}
                    <div className="flex flex-row md:flex-col items-center justify-between md:items-end">
                      <div className="text-center md:text-right">
                        {formatPrice(variation.price, variation.discount_price)}
                      </div>
                      {!isOutOfStock && (
                        <button
                          className="bg-primary text-white px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm md:w-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(variation);
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-2">
          <p className="text-xs text-gray-600 text-center">
            Choose a variation to add to your cart
          </p>
        </div>
      </div>
    </div>
  );
}
