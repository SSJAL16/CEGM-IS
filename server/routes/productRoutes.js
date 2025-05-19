import express from "express";
import ProductDetailsModel from "../models/CenteredTable/ProductDetails.js";
import CounterModel from "../models/Inventory/CounterModel.js";

const router = express.Router();

// Route to get all products
router.get("/", async (req, res) => {
  try {
    const products = await ProductDetailsModel.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to add a new product
router.post("/", async (req, res) => {
  try {
    const newProduct = new ProductDetailsModel(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct); // Send back the saved product
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding product" });
  }
});

// Update a product
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await ProductDetailsModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // This will apply validation on the updated fields
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await ProductDetailsModel.findByIdAndDelete(
      req.params.id
    );
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error.message });
  }
});

// Route to add multiple products at once or update existing ones
router.post("/bulk", async (req, res) => {
  try {
    // Check if req.body is an array and contains data
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res
        .status(400)
        .json({ message: "Data should be a non-empty array of products" });
    }

    // Fetch the current counter and initialize unique IDs
    const counter = await CounterModel.findOneAndUpdate(
      { id: "productId" },
      { $inc: { seq: req.body.length } },
      { new: true, upsert: true }
    );

    // Map each product to assign a unique product_Id
    const productsWithId = req.body.map((product, index) => {
      const formattedId = `PI${String(
        counter.seq - req.body.length + 1 + index
      ).padStart(5, "0")}`;
      return { ...product, product_Id: formattedId };
    });

    // Prepare bulk operations
    const bulkOps = [];
    for (const product of productsWithId) {
      const existingProduct = await ProductDetailsModel.findOne({
        product_Category: product.product_Category,
        product_Description: product.product_Description,
      });

      if (existingProduct) {
        // If the product exists, update stock and optionally quantity/price
        const updateData = {
          $inc: {
            product_Current_Stock: product.product_Current_Stock || 0,
          },
        };

        // Ensure product_Name is updated or preserved
        if (product.product_Name) {
          updateData.product_Name = product.product_Name; // Update or add product_Name
        }

        if (product.product_Quantity) {
          updateData.$inc.product_Quantity = product.product_Quantity;
        }
        if (product.product_Price) {
          updateData.product_Price = product.product_Price;
        }

        bulkOps.push({
          updateOne: {
            filter: { _id: existingProduct._id },
            update: updateData,
          },
        });
      } else {
        // If the product doesn't exist, insert a new one
        bulkOps.push({
          insertOne: {
            document: product,
          },
        });
      }
    }

    // Execute bulk write
    const result = await ProductDetailsModel.bulkWrite(bulkOps);

    // Retrieve updated and inserted products
    const insertedOrUpdatedProducts = productsWithId.map(
      (product) => product.product_Id
    );

    res.status(201).json({
      message: "Products processed successfully",
      insertedOrUpdatedProducts,
    });
  } catch (error) {
    console.error("Error processing products:", error);
    res.status(500).json({ message: "Error processing products" });
  }
});

export default router;
