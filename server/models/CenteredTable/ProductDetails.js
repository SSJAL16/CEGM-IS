import mongoose from "mongoose";
import CounterModel from "./Counter.js"; // Ensure the `.js` extension is included

// Define the schema for productDetails
const ProductDetailsSchema = new mongoose.Schema(
  {
    product_Id: { type: String, unique: true },
    product_Name: { type: String, required: true },
    product_Category: { type: String, required: true },
    product_Supplier: { type: String, required: true },
    product_Description: { type: String, required: true },
    product_Current_Stock: { type: Number, required: true },
    product_Quantity: { type: Number },
    product_Price: { type: Number, required: true },
    product_Unit: { type: String },
    product_Minimum_Stock_Level: { type: Number, required: true },
    product_Maximum_Stock_Level: { type: Number, required: true },
    product_Date: { type: Date, default: Date.now },
    product_Status: { type: String },
    product_Shelf_Life: { type: String, required: true },
  },
  {
    collection: "productDetails",
  }
);

// Pre-save hook to calculate expiry date based on shelf life
ProductDetailsSchema.pre("save", function (next) {
  if (this.product_Shelf_Life) {
    this.expiry_Date = new Date(
      this.product_Date.getTime() +
        this.product_Shelf_Life * 24 * 60 * 60 * 1000
    );
  }
  next();
});

// Pre-save hook to generate custom product ID
ProductDetailsSchema.pre("save", async function (next) {
  const product = this;

  // Only generate a new product ID if it hasn't been set already
  if (!product.product_Id) {
    try {
      // Find the counter and increment it by 1
      const counter = await CounterModel.findOneAndUpdate(
        { id: "productId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true } // Create if doesn't exist
      );

      // Format the ID as "PI" followed by a 5-digit number
      const formattedId = `PI${String(counter.seq).padStart(5, "0")}`;
      product.product_Id = formattedId;

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Create the model based on the schema
const ProductDetailsModel = mongoose.model(
  "ProductDetails",
  ProductDetailsSchema
);

// Export the model for use in other files
export default ProductDetailsModel;
