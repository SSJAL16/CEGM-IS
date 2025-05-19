import express from "express";
import StorageSupplierModel from "../models/CenteredTable/StorageSupplier.js";

const router = express.Router();

// GET all storage suppliers (Read)
router.get("/", async (req, res) => {
  try {
    const storageSupplier = await StorageSupplierModel.find();
    res.json(storageSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// POST a new storage supplier (Create)
router.post("/", async (req, res) => {
  const { name } = req.body;

  // Basic validation
  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Storage supplier name is required" });
  }

  try {
    const newStorageSupplier = new StorageSupplierModel({ name });
    const savedStorageSupplier = await newStorageSupplier.save();
    res.status(201).json({ success: true, data: savedStorageSupplier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// PUT to update an existing storage supplier (Update)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Storage supplier name is required" });
  }

  try {
    const updatedStorageSupplier = await StorageSupplierModel.findByIdAndUpdate(
      id,
      { name },
      { new: true } // Returns the updated document
    );

    if (!updatedStorageSupplier) {
      return res
        .status(404)
        .json({ success: false, message: "Storage supplier not found" });
    }

    res.json({ success: true, data: updatedStorageSupplier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// DELETE a storage supplier (Delete)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStorageSupplier = await StorageSupplierModel.findByIdAndDelete(
      id
    );

    if (!deletedStorageSupplier) {
      return res
        .status(404)
        .json({ success: false, message: "Storage supplier not found" });
    }

    res.json({
      success: true,
      message: "Storage supplier deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
