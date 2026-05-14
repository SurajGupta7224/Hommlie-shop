import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import Icon from "@/components/ui/AppIcon";
import VariationSelectionModal from "@/components/VariationSelectionModal";
import api from "@/api";

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
  product_id: number;
  variation_id: number;
  name: string;
  weight: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  category: string;
  category_slug: string;
  subcategory: string;
  subcategory_slug: string;
  badge: string | null;
  slug: string;
  description: string;
  variations: Variation[];
  user_id?: number;
}

interface ProductGridProps {
  category: string;
  subcategory: string;
  sort: string;
}

export default function ProductGrid({
  category,
  subcategory,
  sort,
}: ProductGridProps) {
  const { addItem, removeItem, updateQuantity, getItemQty, items } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showVariationModal, setShowVariationModal] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = "/products";
        if (category !== "all") {
          url = `/products/category/${category}`;
        }

        const response = await api.get(url);

        if (response.data.status === 1) {
          // Transform API response to match our expected format
          const transformedProducts = response.data.data.map(
            (product: any) => ({
              id: product.id,
              product_id: product.id,
              variation_id: product.variations?.[0]?.id || 1,
              name: product.name,
              weight: product.variations?.[0]?.label || "1 unit",
              price:
                product.variations?.[0]?.discount_price ||
                product.variations?.[0]?.price ||
                0,
              originalPrice:
                product.variations?.[0]?.price ||
                product.variations?.[0]?.discount_price ||
                0,
              image: product.thumbnail || "https://via.placeholder.com/400",
              rating: product.rating || 4.5,
              category: product.category_name || "General",
              category_slug: product.category_slug || "general",
              subcategory: product.subcategory_name || "General",
              subcategory_slug: product.subcategory_slug || "general",
              badge: product.is_best_seller ? "Bestseller" : null,
              slug: product.slug,
              description: product.description,
              user_id: product.user_id,
              variations: product.variations || [],
            }),
          );

          setAllProducts(transformedProducts);
        } else {
          setError("Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Error loading products");
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const products = useMemo(() => {
    let list = allProducts;

    // Filter by subcategory slug
    if (subcategory !== "all") {
      list = list.filter((p) => p.subcategory_slug === subcategory);
    }

    // Sort
    if (sort === "price-asc")
      list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc")
      list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "rating")
      list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [allProducts, subcategory, sort]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-base font-semibold text-foreground">
          Loading products...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <span className="text-5xl">⚠️</span>
        <p className="text-base font-semibold text-foreground">{error}</p>
        <p className="text-sm text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <span className="text-5xl">🔍</span>
        <p className="text-base font-semibold text-foreground">
          No products found
        </p>
        <p className="text-sm text-muted-foreground">
          Try a different category
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((product) => {
          const qty = getItemQty(product.product_id, product.variation_id);
          const discount =
            product.originalPrice > product.price
              ? Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100,
                )
              : 0;

          return (
            <Link
              key={product.id}
              to={`/${product.category_slug}/${product.subcategory_slug}/${product.slug}`}
              className="product-card flex flex-col group no-underline"
            >
              {/* Image */}
              <div className="relative h-36 bg-muted overflow-hidden block rounded-t-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {product.badge && (
                  <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full z-10 shadow-sm">
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="absolute top-2 right-2 bg-success text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full z-10 shadow-sm">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-[11px] text-muted-foreground font-medium mb-0.5">
                  {product.weight}
                </p>
                <p className="text-sm font-semibold text-foreground leading-tight mb-1.5 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                  {product.name}
                </p>

                <div className="flex items-center gap-1 mb-2">
                  <Icon
                    name="StarIcon"
                    size={11}
                    className="text-accent"
                    variant="solid"
                  />
                  <span className="text-[11px] font-semibold text-foreground">
                    {product.rating}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-lg font-semibold text-foreground">
                      ₹{product.price}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-[11px] text-muted-foreground line-through ml-1">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (
                          product.variations &&
                          product.variations.length > 1
                        ) {
                          setSelectedProduct(product);
                          setShowVariationModal(true);
                        } else {
                          addItem({
                            product_id: product.product_id,
                            variation_id: product.variation_id,
                            user_id: product.user_id
                          });
                        }
                      }}
                      className="add-btn"
                    >
                      +
                    </button>
                  ) : (
                    <div
                      className="flex flex-col items-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const cartItem = items.find(
                              (item) =>
                                item.product.id === product.product_id &&
                                item.variation.id === product.variation_id,
                            );
                            if (cartItem) {
                              if (cartItem.quantity > 1) {
                                updateQuantity(
                                  cartItem.id,
                                  cartItem.quantity - 1,
                                );
                              } else {
                                removeItem(
                                  product.product_id,
                                  product.variation_id,
                                );
                              }
                            }
                          }}
                          className="qty-btn"
                        >
                          −
                        </button>
                        <span className="text-base font-semibold text-foreground w-4 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (product.variations && product.variations.length > 1) {
                              setSelectedProduct(product);
                              setShowVariationModal(true);
                            } else {
                              addItem({
                                product_id: product.product_id,
                                variation_id: product.variation_id,
                                user_id: product.user_id
                              });
                            }
                          }}
                          className="qty-btn bg-primary text-white border-primary"
                        >
                          +
                        </button>
                      </div>
                      {/* "Add Variant" button removed — + now handles it */}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Variation Selection Modal */}
      {/* Variation Selection Modal */}
      {selectedProduct && (
        <VariationSelectionModal
          isOpen={showVariationModal}
          onClose={() => {
            setShowVariationModal(false);
            setSelectedProduct(null);
          }}
          product={{
            id: selectedProduct.id,
            name: selectedProduct.name,
            image: selectedProduct.image,
            user_id: selectedProduct.user_id,
            variations: selectedProduct.variations.map((variation) => ({
              id: variation.id,
              label: variation.name || variation.weight || "Default Variant",
              sku: variation.sku || "",
              unit: variation.unit || null,
              weight: variation.weight || null,
              price: variation.price || 0,
              discount_price: variation.discount_price || null,
              discount_percent:
                variation.discount_price &&
                variation.price > variation.discount_price
                  ? Math.round(
                      ((variation.price - variation.discount_price) /
                        variation.price) *
                        100,
                    )
                  : 0,
              stock: variation.stock || 0,
            })),
          }}
        />
      )}
    </>
  );
}
