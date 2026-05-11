const { Product, ProductVariation, ProductImage, Category, SubCategory, WarehouseInventory } = require("../../models/index");
const { Op } = require("sequelize");

const getUploadUrl = () => {
  const baseUrl = process.env.APP_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads`;
};

// Helper to format product response
const formatProductResponse = (p) => {
  const plain = typeof p.get === 'function' ? p.get({ plain: true }) : p;
  const uploadUrl = getUploadUrl();
  
  // Calculate images array
  const imageList = (plain.images || []).map(img => `${uploadUrl}/ProductImages/${img.image}`);
  const thumbnail = imageList.length > 0 ? imageList[0] : null;

  // Format variations
  const variations = (plain.variations || []).map((v, index) => {
    const inv = v.warehouseInventory && v.warehouseInventory.length > 0 ? v.warehouseInventory[0] : {};
    const price = parseFloat(inv.price || 0);
    const discountPrice = parseFloat(inv.discount_price || 0);
    const discountPercent = price > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

    // Create unique variation name by combining available fields
    let variationName = v.variation_name || v.unit || `Variation ${index + 1}`;
    
    // If variation_name exists but we have multiple variations, add unit or weight to make it unique
    if (v.variation_name && (v.unit || v.weight)) {
      const suffix = v.unit || v.weight;
      variationName = `${v.variation_name} ${suffix}`;
    } else if (v.unit && v.weight) {
      // If we have both unit and weight, combine them
      variationName = `${v.unit} - ${v.weight}`;
    } else if (v.unit) {
      variationName = v.unit;
    } else if (v.weight) {
      variationName = v.weight;
    }

    return {
      id: v.id,
      name: variationName,
      sku: v.sku || "",
      unit: v.unit || null,
      weight: v.weight || null,
      label: variationName,
      price: price,
      discount_price: discountPrice,
      discount_percent: discountPercent,
      stock: inv.stock || 0,
      is_default: index === 0
    };
  });

  return {
    id: plain.id,
    user_id: plain.user_id,
    name: plain.name,
    slug: plain.slug,
    category_name: plain.category ? plain.category.name : '',
    category_slug: plain.category ? plain.category.slug : 'uncategorized',
    subcategory_name: plain.subCategory ? plain.subCategory.name : '',
    subcategory_slug: plain.subCategory ? plain.subCategory.slug : 'general',
    thumbnail: thumbnail,
    images: imageList,
    variations: variations,
    rating: 4.5,
    review: 120,
    delivery_time: "10 min",
    is_best_seller: true,
    description: plain.description || ""
  };
};

// Helper for product fetching associations
const productInclude = [
  {
    model: ProductImage,
    as: "images",
    attributes: ["id", "image", "is_primary"],
    required: false
  },
  {
    model: Category,
    as: "category",
    attributes: ["name", "slug"],
    required: false
  },
  {
    model: SubCategory,
    as: "subCategory",
    attributes: ["name", "slug"],
    required: false
  },
  {
    model: ProductVariation,
    as: "variations",
    attributes: ["id", "variation_name", "sku", "unit", "weight"],
    required: false,
    include: [
      {
        model: WarehouseInventory,
        as: "warehouseInventory",
        attributes: ["price", "discount_price", "stock"],
        required: false
      }
    ]
  }
];

const productExclude = ["short_description", "meta_title", "meta_description", "meta_keywords", "createdAt", "updatedAt"];
const categoryExclude = ["user_id", "description", "meta_title", "meta_description", "createdAt", "updatedAt"];

// Get all products (with optional filters)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: 1 },
      attributes: { exclude: productExclude },
      include: productInclude
    });

    return res.status(200).json({ status: 1, message: "data fetch successfully", data: products.map(formatProductResponse) });
  } catch (error) {
    return res.status(500).json({ status: 0, message: error.message });
  }
};

// Get products by Category
const getProductsByCategory = async (req, res) => {
  const { slug } = req.params;
  try {
    const category = await Category.findOne({ where: { slug, status: 1 } });
    if (!category) return res.status(404).json({ status: 0, message: "Category not found" });

    const products = await Product.findAll({
      where: { category_id: category.id, status: 1 },
      attributes: { exclude: productExclude },
      include: productInclude
    });

    return res.status(200).json({ status: 1, message: "data fetch success fully", data: products.map(formatProductResponse) });
  } catch (error) {
    return res.status(500).json({ status: 0, message: error.message });
  }
};

// Search products
const searchProducts = async (req, res) => {
  const { query } = req.query;
  try {
    const products = await Product.findAll({
      where: {
        status: 1,
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: { exclude: productExclude },
      include: productInclude
    });
    return res.status(200).json({ status: 1, message: "data fetch success fully", data: products.map(formatProductResponse) });
  } catch (error) {
    return res.status(500).json({ status: 0, message: error.message });
  }
};

// Get Product Detail
const getProductDetail = async (req, res) => {
  const { slug } = req.params;
  try {
    // Trim slug to avoid whitespace issues
    const cleanSlug = slug.trim();
    console.log(`[API V2] Fetching detail for: ${cleanSlug}`);
    
    const product = await Product.findOne({
      where: { slug: cleanSlug, status: 1 },
      attributes: { exclude: productExclude },
      include: productInclude
    });
    
    if (!product) {
      console.log(`[API V2] Product NOT found in DB for slug: ${cleanSlug}`);
      return res.status(404).json({ status: 0, message: `Product not found for slug: ${cleanSlug}` });
    }
    
    console.log(`[API V2] Product found: ${product.name}`);
    return res.status(200).json({ status: 1, message: "data fetch success fully", data: formatProductResponse(product) });
  } catch (error) {
    console.error("[API V2] Product Detail Error:", error);
    return res.status(500).json({ status: 0, message: error.message });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const uploadUrl = getUploadUrl();
    const categories = await Category.findAll({ 
      where: { status: 1 },
      attributes: { exclude: categoryExclude },
      include: [{ 
        model: SubCategory, 
        as: "subCategories", 
        where: { status: 1 }, 
        attributes: { exclude: categoryExclude },
        required: false 
      }]
    });

    const formatted = categories.map(cat => {
      const plainCat = cat.get({ plain: true });
      if (plainCat.image) plainCat.image = `${uploadUrl}/Category/${plainCat.image}`;
      if (plainCat.subCategories) {
        plainCat.subCategories = plainCat.subCategories.map(sub => {
          if (sub.image) sub.image = `${uploadUrl}/SubCategory/${sub.image}`;
          return sub;
        });
      }
      return plainCat;
    });

    return res.status(200).json({ status: 1, message: "data fetch success fully", data: formatted });
  } catch (error) {
    return res.status(500).json({ status: 0, message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  searchProducts,
  getProductDetail,
  getAllCategories
};
