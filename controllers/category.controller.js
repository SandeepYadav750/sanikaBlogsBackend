import Category from "../models/category.model.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.id; // Assuming you have user authentication and the user ID is available in req.id

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "Category is required", success: false });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    const existingCategory = await Category.findOne({ name: name.trim() }).lean();
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category already exists", success: false });
    }

    const category = await Category.create({
      name: name.trim(),
      userId,
    });
    await category.populate({
      path: "userId",
      select: "firstName lastName photoURL",
    });

    return res.status(201).json({
      message: "Category created successfully",
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({
      message: "Failed to create category",
      success: false,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const userId = req.id;

    //FIND ALL Category POST CreATED BY THE LOGGED IN USER
    const myCategory = await Category.find({ userId }).select("_id").lean();
    const myCategorys = myCategory.map((category) => category._id);

    if (myCategorys.length === 0) {
      return res.status(200).json({
        message: "No categories found for this user",
        success: false,
        categories: [],
        totalCategories: 0,
      });
    }

    const categories = await Category.find({
      _id: { $in: myCategorys },
    }).populate("userId", "firstName lastName email");

    return res.status(200).json({
      message: "Categories retrieved successfully",
      success: true,
      data: categories,
      totalCategories: categories.length,
    });
  } catch (error) {
    console.error("Error retrieving categories:", error);
    return res.status(500).json({
      message: "Failed to retrieve categories",
      success: false,
    });
  }
};

export const getAllUsersCategories = async (req, res) => {
  try {
    // Fetch ALL categories from database
    const categories = await Category.find({})
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean(); // Optional: sort by newest first

    return res.status(200).json({
      message: "All Categories retrieved successfully",
      success: true,
      categories,
      totalCategories: categories.length,
    });
  } catch (error) {
    console.error("Error retrieving categories:", error);
    return res.status(500).json({
      message: "Failed to retrieve categories",
      success: false,
    });
  }
};

export const editCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.id;
    const { name } = req.body;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res
        .status(404)
        .json({ message: "Category not found", success: false });
    }
    if (!category.userId || category.userId.toString() !== userId) {
      return res.status(403).json({
        message: "User not authorized to edit this category",
        success: false,
      });
    }

    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category already exists", success: false });
    }

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "Category name is required", success: false });
    }
    category.name = name.trim();
    category.editedAt = Date.now();
    await category.save();

    return res.status(200).json({
      message: "Category updated successfully",
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error editing category:", error);
    return res.status(500).json({
      message: "Failed to edit category",
      success: false,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.id;
    const category = await Category.findById(categoryId).lean();

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        success: false,
      });
    }

    if (!category.userId || category.userId.toString() !== userId) {
      return res.status(403).json({
        message: "User not authorized to delete this category",
        success: false,
      });
    }

    await Category.findByIdAndDelete(categoryId);

    return res.status(200).json({
      message: "Category deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      message: "Failed to delete category",
      success: false,
    });
  }
};
