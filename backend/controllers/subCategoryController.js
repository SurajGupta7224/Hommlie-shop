const { SubCategory, Category } = require("../models/index");
const { Op } = require("sequelize");

// GET /api/sub-categories
const getAllSubCategories = async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '', category_id = '' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where.name = { [Op.like]: `%${search}%` };
  }
  if (status !== '') {
    where.status = status;
  }
  if (category_id !== '') {
    where.category_id = category_id;
  }
  where.user_id = req.user.id; // Enforce ownership

  try {
    const { count, rows } = await SubCategory.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      subCategories: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("getAllSubCategories error:", err);
    return res.status(500).json({ message: "Failed to fetch sub-categories" });
  }
};

// POST /api/sub-categories
const createSubCategory = async (req, res) => {
  const { category_id, name, slug, description, alt_tag, meta_title, meta_description, status } = req.body;
  const image = req.files && req.files.subcategory_image ? req.files.subcategory_image[0].filename : null;

  if (!category_id) {
    return res.status(400).json({ message: "Category is required" });
  }
  if (!name || !slug) {
    return res.status(400).json({ message: "Name and Slug are required" });
  }

  // Verify the category exists and belongs to the user
  const categoryExists = await Category.findOne({ where: { id: category_id, user_id: req.user.id } });
  if (!categoryExists) {
    return res.status(400).json({ message: "Selected category does not exist or access denied" });
  }

  try {
    const subCategory = await SubCategory.create({
      user_id: req.user.id, // Assign ownership
      category_id,
      name,
      slug,
      description,
      image,
      alt_tag,
      meta_title,
      meta_description,
      status: status !== undefined ? status : 1,
    });

    return res.status(201).json({ message: "Sub-category created successfully", subCategory });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Slug must be unique" });
    }
    console.error("createSubCategory error:", err);
    return res.status(500).json({ message: "Failed to create sub-category" });
  }
};

// PUT /api/sub-categories/:id
const updateSubCategory = async (req, res) => {
  const { id } = req.params;
  const { category_id, name, slug, description, alt_tag, meta_title, meta_description, status } = req.body;

  try {
    const subCategory = await SubCategory.findOne({ where: { id, user_id: req.user.id } });
    if (!subCategory) return res.status(404).json({ message: "Sub-category not found or access denied" });

    if (category_id) {
      const categoryExists = await Category.findOne({ where: { id: category_id, user_id: req.user.id } });
      if (!categoryExists) {
        return res.status(400).json({ message: "Selected category does not exist or access denied" });
      }
    }

    const updateData = {
      category_id: category_id || subCategory.category_id,
      name: name || subCategory.name,
      slug: slug || subCategory.slug,
      description: description !== undefined ? description : subCategory.description,
      alt_tag: alt_tag !== undefined ? alt_tag : subCategory.alt_tag,
      meta_title: meta_title !== undefined ? meta_title : subCategory.meta_title,
      meta_description: meta_description !== undefined ? meta_description : subCategory.meta_description,
      status: status !== undefined ? status : subCategory.status,
    };

    if (req.files && req.files.subcategory_image) {
      updateData.image = req.files.subcategory_image[0].filename;
    }

    await subCategory.update(updateData);
    return res.status(200).json({ message: "Sub-category updated successfully", subCategory });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Slug must be unique" });
    }
    console.error("updateSubCategory error:", err);
    return res.status(500).json({ message: "Failed to update sub-category" });
  }
};

// PATCH /api/sub-categories/:id/status
const toggleSubCategoryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const subCategory = await SubCategory.findOne({ where: { id, user_id: req.user.id } });
    if (!subCategory) return res.status(404).json({ message: "Sub-category not found or access denied" });

    await subCategory.update({ status });
    return res.status(200).json({ message: "Status updated successfully", status });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update status" });
  }
};

// DELETE /api/sub-categories/:id  (soft delete)
const deleteSubCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const subCategory = await SubCategory.findOne({ where: { id, user_id: req.user.id } });
    if (!subCategory) return res.status(404).json({ message: "Sub-category not found or access denied" });

    // Soft delete via status = 0
    await subCategory.update({ status: 0 });
    return res.status(200).json({ message: "Sub-category deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete sub-category" });
  }
};

module.exports = {
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  toggleSubCategoryStatus,
  deleteSubCategory,
};
