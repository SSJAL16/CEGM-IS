import mongoose from "mongoose";

// Define the schema for the storage supplier
const StorageSupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Storage Supplier name
  },
  {
    collection: "storageSupplier", // Specify the collection name explicitly
  }
);

// Check if the StorageSupplier model already exists in mongoose.models and use it, otherwise define it
const StorageSupplierModel =
  mongoose.models.StorageSupplier ||
  mongoose.model("StorageSupplier", StorageSupplierSchema);

// Export the model for use in other files
export default StorageSupplierModel;
