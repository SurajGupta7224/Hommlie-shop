import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

interface ModalVariation {
  id: number;
  label: string;
  sku?: string;
  unit?: string | null;
  weight?: string | null;
  price: number;
  discount_price: number | null;
  discount_percent: number;
  stock: number;
}

interface ModalProduct {
  id: number;
  name: string;
  image: string | null;
  variations: ModalVariation[];
}

interface VariationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ModalProduct;
}

export default function VariationSelectionModal({
  isOpen,
  onClose,
  product,
}: VariationSelectionModalProps) {
  const { addItem } = useCart();

  const handleAddToCart = async (variation: ModalVariation) => {
    if (variation.stock <= 0) {
      toast.error("This variation is out of stock");
      return;
    }

    try {
      await addItem({
        product_id: product.id,
        variation_id: variation.id,
        quantity: 1,
      });

      toast.success("Added to cart");
      onClose();
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const formatPrice = (
    price: number,
    discountPrice: number | null,
    discountPercent: number
  ) => {
    if (discountPrice && discountPrice < price) {
      return (
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold text-gray-900">
            ₹{discountPrice}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 line-through">
              ₹{price}
            </span>

            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
              {discountPercent}% off
            </span>
          </div>
        </div>
      );
    }

    return (
      <span className="text-xl font-bold text-gray-900">
        ₹{price}
      </span>
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-5">
          <div className="flex items-start gap-4 pr-14">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={product.image || "https://via.placeholder.com/400"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900">
                Select Variation
              </h2>

              <p className="text-sm text-gray-600 leading-relaxed break-words">
                {product.name}
              </p>
            </div>
          </div>
        </div>

        {/* Variation List */}
        <div className="overflow-y-auto max-h-[65vh] p-4 space-y-4">
          {product.variations.map((variation) => {
            const isOutOfStock = variation.stock <= 0;

            return (
              <div
                key={variation.id}
                className={`border rounded-xl p-4 transition-all ${
                  isOutOfStock
                    ? "border-gray-200 bg-gray-50 opacity-60"
                    : "border-gray-200 hover:border-primary hover:shadow-md bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left Side */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {variation.label}
                      </h3>

                      {variation.unit && (
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                          {variation.unit}
                        </span>
                      )}

                      {variation.weight && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {variation.weight}
                        </span>
                      )}

                      {isOutOfStock && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {variation.sku && (
                      <p className="text-xs text-gray-500 mb-2">
                        SKU: {variation.sku}
                      </p>
                    )}

                    {!isOutOfStock && (
                      <p className="text-sm text-green-600 font-medium">
                        {variation.stock > 10
                          ? "In Stock"
                          : `Only ${variation.stock} left`}
                      </p>
                    )}
                  </div>

                  {/* Right Side */}
                  <div className="flex flex-col items-end gap-3">
                    {formatPrice(
                      variation.price,
                      variation.discount_price,
                      variation.discount_percent
                    )}

                    {!isOutOfStock && (
                      <button
                        onClick={() => handleAddToCart(variation)}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
                      >
                        + ADD
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-600 text-center">
            Choose a variation to add to your cart
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}