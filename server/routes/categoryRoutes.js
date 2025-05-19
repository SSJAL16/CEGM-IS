import express from "express";
import CategoryModel from "../models/CenteredTable/Category.js";

const router = express.Router();

// GET all categories (Read)
router.get("/", async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// POST a new category (Create)
router.post("/", async (req, res) => {
  const { product_Category } = req.body;

  // Basic validation
  if (!product_Category) {
    return res
      .status(400)
      .json({ success: false, message: "Product category is required" });
  }

  try {
    const newCategory = new CategoryModel({ product_Category });
    const savedCategory = await newCategory.save();
    res.status(201).json({ success: true, data: savedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// PUT to update an existing category (Update)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { product_Category } = req.body;

  if (!product_Category) {
    return res
      .status(400)
      .json({ success: false, message: "Product category is required" });
  }

  try {
    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      { product_Category },
      { new: true } // Returns the updated document
    );

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: updatedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// DELETE a category (Delete)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await CategoryModel.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
