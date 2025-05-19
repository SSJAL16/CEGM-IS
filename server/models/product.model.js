import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    product_Name: { type: String, required: true},
    product_Description: { type: String, required: true},
    product_Category: { type: String, required: true},
    product_Price: { type: Number, required: true, min: 0},
    product_Current_Stock: { type: Number, required: true, min: 0},
    product_Minimum_Stock_Level: { type: Number, required: true},
    product_Maximum_Stock_Level: { type: Number, required: true},

  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
