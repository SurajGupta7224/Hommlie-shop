const { Category, SubCategory, Product, ProductVariation, ProductImage, WarehouseInventory } = require("../../models/index");
const { Op } = require("sequelize");

const getHomepageData = async (req, res) => {
  try {
    const baseUrl = process.env.APP_URL || 'http://localhost:5000';
    const uploadUrl = `${baseUrl}/uploads`;

    // Helper for product formatting
    const formatProductResponse = (p) => {
      const plain = p.get({ plain: true });
      
      // Calculate thumbnail from primary image
      const primaryImage = plain.images && plain.images.length > 0 ? plain.images[0].image : null;
      const thumbnail = primaryImage ? `${uploadUrl}/ProductImages/${primaryImage}` : null;

      // Format variations
      const variations = (plain.variations || []).map((v, index) => {
        const inv = v.warehouseInventory && v.warehouseInventory.length > 0 ? v.warehouseInventory[0] : {};
        const price = parseFloat(inv.price || 0);
        const discountPrice = parseFloat(inv.discount_price || 0);
        const discountPercent = price > 0 ? Math.round(((price - discountPrice) / price) * 100) : 0;

        return {
          id: v.id,
          label: v.variation_name || v.unit || "",
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
        variations: variations,
        rating: 4.5,
        review: 120,
        delivery_time: "10 min",
        is_best_seller: true
      };
    };

    // Common exclusions
    const commonExclude = ["description", "meta_title", "meta_description", "createdAt", "updatedAt"];

    // 1. Shop by Category
    const categories = await Category.findAll({
      where: { status: 1 },
      attributes: { exclude: commonExclude },
      include: [
        {
          model: SubCategory,
          as: "subCategories",
          where: { status: 1 },
          attributes: { exclude: commonExclude },
          required: false
        }
      ],
      limit: 10
    });

    const shopByCategory = categories.map(cat => {
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

    // Helper for product fetching associations
    const productInclude = [
      {
        model: ProductImage,
        as: "images",
        attributes: ["id", "image"],
        where: { is_primary: 1 },
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

    const productExclude = ["description", "short_description", "meta_title", "meta_description", "meta_keywords", "createdAt", "updatedAt"];

    // 2. Trending Now
    const trendingProductsRaw = await Product.findAll({
      where: { status: 1 },
      attributes: { exclude: productExclude },
      include: productInclude,
      limit: 8,
      order: [['id', 'DESC']]
    });
    const trendingProducts = trendingProductsRaw.map(formatProductResponse);

    // 3. Best Sellers
    const bestSellersRaw = await Product.findAll({
      where: { status: 1 },
      attributes: { exclude: productExclude },
      include: productInclude,
      limit: 8,
      order: [['id', 'DESC']]
    });
    const bestSellers = bestSellersRaw.map(formatProductResponse);

    // 4. Deals of the Day
    const dealsOfDayRaw = await Product.findAll({
      where: { status: 1 },
      attributes: { exclude: productExclude },
      include: productInclude,
      limit: 8,
      order: [['name', 'ASC']]
    });
    const dealsOfDay = dealsOfDayRaw.map(formatProductResponse);

    return res.status(200).json({
      status: 1,
      message: "data fetch success fully",
      data: {
        shopByCategory,
        trendingProducts,
        bestSellers,
        dealsOfDay
      }
    });
  } catch (error) {
    console.error("Homepage Data Error:", error);
    return res.status(500).json({
      status: 0,
      message: "Failed to fetch homepage data",
      error: error.message
    });
  }
};

module.exports = {
  getHomepageData
};
