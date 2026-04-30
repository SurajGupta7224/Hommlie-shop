const { Product, ProductVariation, ProductImage, Category, SubCategory } = require("../models/index");
const { Op } = require("sequelize");

// GET /api/products
const getAllProducts = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '', category_id = '', subcategory_id = '' } = req.query;
  const offset = (page - 1) * limit;
  const where = {};
  if (search) where.name = { [Op.like]: `%${search}%` };
  if (status !== '') where.status = status;
  if (category_id !== '') where.category_id = category_id;
  if (subcategory_id !== '') where.subcategory_id = subcategory_id;
  where.user_id = req.user.id; // Enforce ownership

  try {
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: SubCategory, as: "subCategory", attributes: ["id", "name"] },
        { model: ProductImage, as: "images", required: false },
        { model: ProductVariation, as: "variations" },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
      distinct: true,
    });
    return res.status(200).json({
      products: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("getAllProducts error:", err);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: SubCategory, as: "subCategory", attributes: ["id", "name"] },
        { model: ProductVariation, as: "variations" },
        { model: ProductImage, as: "images" },
      ],
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ product });
  } catch (err) {
    console.error("getProductById error:", err);
    return res.status(500).json({ message: "Failed to fetch product" });
  }
};

// GET /api/products/:id/variations
const getProductVariations = async (req, res) => {
  const { id } = req.params;
  try {
    const variations = await ProductVariation.findAll({ where: { product_id: id }, order: [["id", "ASC"]] });
    return res.status(200).json({ variations });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch variations" });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  const {
    category_id, subcategory_id, name, slug,
    short_description, description,
    meta_title, meta_description, meta_keywords, status,
    variations: variationsJson,
    image_alt_texts, image_meta_titles, image_meta_descriptions, image_is_primary,
  } = req.body;

  const files = req.files?.product_images || [];

  if (!category_id || !name || !slug) {
    return res.status(400).json({ message: "Category, Name, and Slug are required" });
  }

  let variations = [];
  try { variations = JSON.parse(variationsJson || '[]'); } catch { variations = []; }

  if (variations.length === 0) {
    return res.status(400).json({ message: "At least one variation is required" });
  }
  if (files.length === 0) {
    return res.status(400).json({ message: "At least one image is required" });
  }

  try {
    // 1. Create product
    const product = await Product.create({
      user_id: req.user?.id || null,
      category_id, subcategory_id: subcategory_id || null,
      name, slug, short_description, description,
      meta_title, meta_description, meta_keywords,
      status: status !== undefined ? parseInt(status) : 1,
    });

    // 2. Insert variations
    for (const v of variations) {
      await ProductVariation.create({
        product_id: product.id,
        variation_name: v.variation_name,
        sku: v.sku,
        unit: v.unit,
        weight: v.weight,
        status: 1,
      });
    }

    // 3. Insert images (metadata arrays match file array)
    const altTexts = [].concat(image_alt_texts || []);
    const metaTitles = [].concat(image_meta_titles || []);
    const metaDescs = [].concat(image_meta_descriptions || []);
    const isPrimary = [].concat(image_is_primary || []);

    for (let i = 0; i < files.length; i++) {
      await ProductImage.create({
        product_id: product.id,
        image: files[i].filename,
        alt_text: altTexts[i] || '',
        meta_title: metaTitles[i] || '',
        meta_description: metaDescs[i] || '',
        is_primary: isPrimary[i] === '1' || isPrimary[i] === 'true' ? 1 : (i === 0 ? 1 : 0),
      });
    }

    return res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Slug or SKU must be unique" });
    }
    console.error("createProduct error:", err);
    return res.status(500).json({ message: "Failed to create product" });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    category_id, subcategory_id, name, slug,
    short_description, description,
    meta_title, meta_description, meta_keywords, status,
    variations: variationsJson,
    image_alt_texts, image_meta_titles, image_meta_descriptions, image_is_primary,
  } = req.body;

  const files = req.files?.product_images || [];

  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 1. Update product info
    await product.update({
      category_id: category_id || product.category_id,
      subcategory_id: subcategory_id || product.subcategory_id,
      name: name || product.name,
      slug: slug || product.slug,
      short_description: short_description !== undefined ? short_description : product.short_description,
      description: description !== undefined ? description : product.description,
      meta_title: meta_title !== undefined ? meta_title : product.meta_title,
      meta_description: meta_description !== undefined ? meta_description : product.meta_description,
      meta_keywords: meta_keywords !== undefined ? meta_keywords : product.meta_keywords,
      status: status !== undefined ? parseInt(status) : product.status,
    });

    // 2. Replace variations
    if (variationsJson) {
      let variations = [];
      try { variations = JSON.parse(variationsJson); } catch { variations = []; }
      await ProductVariation.destroy({ where: { product_id: id } });
      for (const v of variations) {
        await ProductVariation.create({
          product_id: id,
          variation_name: v.variation_name,
          sku: v.sku,
          unit: v.unit,
          weight: v.weight,
          status: 1,
        });
      }
    }

    // 3. Add new images
    if (files.length > 0) {
      const altTexts = [].concat(image_alt_texts || []);
      const metaTitles = [].concat(image_meta_titles || []);
      const metaDescs = [].concat(image_meta_descriptions || []);
      const isPrimary = [].concat(image_is_primary || []);

      for (let i = 0; i < files.length; i++) {
        await ProductImage.create({
          product_id: id,
          image: files[i].filename,
          alt_text: altTexts[i] || '',
          meta_title: metaTitles[i] || '',
          meta_description: metaDescs[i] || '',
          is_primary: isPrimary[i] === '1' || isPrimary[i] === 'true' ? 1 : 0,
        });
      }
    }

    // 4. Update existing images metadata and remove deleted ones
    if (req.body.existing_images !== undefined) {
      let existingImgs = [];
      try { existingImgs = JSON.parse(req.body.existing_images); } catch { existingImgs = []; }
      
      const existingIds = existingImgs.map(img => img.id);
      
      if (existingIds.length > 0) {
        await ProductImage.destroy({ 
          where: { product_id: id, id: { [Op.notIn]: existingIds } } 
        });
      } else {
        await ProductImage.destroy({ where: { product_id: id } });
      }

      for (const imgData of existingImgs) {
        await ProductImage.update({
          alt_text: imgData.alt_text || '',
          meta_title: imgData.meta_title || '',
          meta_description: imgData.meta_description || '',
          is_primary: imgData.is_primary
        }, { where: { id: imgData.id, product_id: id } });
      }
    }

    return res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Slug or SKU must be unique" });
    }
    console.error("updateProduct error:", err);
    return res.status(500).json({ message: "Failed to update product" });
  }
};

// PATCH /api/products/:id/status
const toggleProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await product.update({ status });
    return res.status(200).json({ message: "Status updated", status });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// DELETE /api/products/:id  (soft delete)
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await product.update({ status: 0 });
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete product" });
  }
};

module.exports = {
  getAllProducts, getProductById, getProductVariations,
  createProduct, updateProduct, toggleProductStatus, deleteProduct,
};
