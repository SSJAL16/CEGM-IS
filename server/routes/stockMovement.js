import express from "express";
import StockMovementModel from "../models/Inventory/StockMovement.js";
import ManualAdjustmentModel from "../models/Inventory/ManualAdjustment.js";

const router = express.Router();

// Route to get all products
router.get("/", async (req, res) => {
  try {
    const products = await StockMovementModel.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update the comment for a specific stock movement
router.patch("/update-comment/:movement_ID", async (req, res) => {
  const { movement_ID } = req.params;
  const { adj_Comment } = req.body;

  try {
    const updatedMovement = await StockMovementModel.findOneAndUpdate(
      { movement_ID }, // Find by movement_ID
      { adj_Comment }, // Update only the comment
      { new: true } // Return the updated document
    );

    if (!updatedMovement) {
      return res.status(404).json({ message: "Stock movement not found" });
    }

    res.status(200).json({
      message: "Comment updated successfully",
      data: updatedMovement,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      message: "Error updating comment",
      error,
    });
  }
});

// Route to create a manual adjustment and linked stock movement entry
router.post("/", async (req, res) => {
  try {
    // Step 1: Create a new manual adjustment entry
    const manualAdjustment = new ManualAdjustmentModel(req.body);
    const savedManualAdjustment = await manualAdjustment.save();

    // Step 2: Create a stock movement entry with movement_ID set to manualAdjust_ID
    const stockMovementData = {
      ...req.body,
      movement_ID: savedManualAdjustment.manualAdjust_ID, // Set movement_ID in StockMovement
    };
    const stockMovement = new StockMovementModel(stockMovementData);
    const savedStockMovement = await stockMovement.save();

    res.status(201).json({
      manualAdjustment: savedManualAdjustment,
      stockMovement: savedStockMovement,
    });
  } catch (error) {
    console.error(
      "Error creating linked manual adjustment and stock movement:",
      error
    ); // Log the full error
    res.status(500).json({
      message: "Error creating linked manual adjustment and stock movement.",
      error,
    });
  }
});

// In stockMovement.js
router.post("/bulk", async (req, res) => {
  try {
    const stockMovements = req.body;
    const result = await StockMovementModel.insertMany(stockMovements);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating stock movements:", error);
    res.status(500).json({
      message: "Error creating stock movements",
      error,
    });
  }
});

// New route for reconciliation
router.post("/reconcile", async (req, res) => {
  try {
    const { movements } = req.body;

    // Iterate through each movement and update the adj_Quantity (physical count)
    for (let movement of movements) {
      // Find the corresponding stock movement document
      const updatedMovement = await StockMovementModel.findOneAndUpdate(
        { movement_ID: movement.movement_ID },
        { adj_Quantity: movement.adj_Quantity },
        { new: true } // Return the updated document
      );
      if (!updatedMovement) {
        return res.status(404).json({ message: "Movement not found" });
      }
    }

    res.status(200).json({ message: "Reconciliation completed successfully!" });
  } catch (error) {
    console.error("Error during reconciliation:", error);
    res.status(500).json({
      message: "Error completing reconciliation",
      error,
    });
  }
});

export default router;
