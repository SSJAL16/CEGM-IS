// models/StockMovementModel.js

import mongoose from "mongoose";

// Define the schema for productDetails
const StockMovementSchema = new mongoose.Schema(
  {
    movement_ID: { type: String },
    product_ID: {
      type: String,
      required: true,
    },
    adj_Description: {
      type: String,
      required: true,
    },
    adj_Category: {
      type: String,
      required: true,
    },
    adj_Quantity: {
      type: Number,
    },
    adj_Price: {
      type: Number,
      required: true,
    },
    adj_Adjustment_Type: {
      type: String,
      required: true,
    },
    adj_Date: {
      type: Date, // Change to Date type
      default: Date.now, // Automatically set to current date
    },
    adj_Comment: {
      type: String,
    },
  },
  {
    collection: "stockMovement", // Specify the collection name explicitly
  }
);

// Create the model based on the schema
const StockMovementModel = mongoose.model("StockMovement", StockMovementSchema);

// Export the model for use in other files
export default StockMovementModel;
