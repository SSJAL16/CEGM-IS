// models/ManualAdjustmentModel.js

import mongoose from "mongoose";

// Define the schema for Manual Adjustment
const ManualAdjustmentSchema = new mongoose.Schema(
  {
    manualAdjust_ID: {
      type: String,
      unique: true, // Ensures uniqueness
      default: function () {
        return `MI${Math.floor(1000 + Math.random() * 9000)}`; // Default ID generator
      },
    },
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
  },
  {
    collection: "manualAdjustment", // Explicitly specify collection name
  }
);

// Create the model based on the schema
const ManualAdjustmentModel = mongoose.model(
  "ManualAdjustment",
  ManualAdjustmentSchema
);

export default ManualAdjustmentModel;
