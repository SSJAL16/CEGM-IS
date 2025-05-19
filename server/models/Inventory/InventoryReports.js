// models/InventoryReportsModal.js

import mongoose from "mongoose";

// Define the schema for productDetails
const InventoryReportsSchema = new mongoose.Schema(
  {
    report_ID: { type: String, required: true },
    reportType: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    generatedDate: { type: String },
  },
  {
    collection: "inventoryReports", // Specify the collection name explicitly
  }
);

// Create the model based on the schema
const InventoryReportsModal = mongoose.model(
  "InventoryReports",
  InventoryReportsSchema
);

// Export the model for use in other files
export default InventoryReportsModal;
