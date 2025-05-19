import mongoose from "mongoose";
import CounterModel from "../CenteredTable/Counter.js"; // Fixed path (assuming Counter.js is in same directory)

// Define the schema for archived products
const ArchiveDetailsSchema = new mongoose.Schema(
  {
    product_Id: { type: String, unique: true },
    product_Name: { type: String },
    product_Category: { type: String },
    product_Supplier: { type: String },
    product_Description: { type: String },
    product_Current_Stock: { type: Number },
    product_Quantity: { type: Number },
    product_Price: { type: Number },
    product_Unit: { type: String },
    product_Minimum_Stock_Level: { type: Number },
    product_Maximum_Stock_Level: { type: Number },
    product_Date: { type: Date, default: Date.now },
    product_Status: { type: String },
    product_Shelf_Life: { type: String },
  },
  {
    collection: "archive",
  }
);

// Pre-save hook to calculate expiry date
ArchiveDetailsSchema.pre("save", function (next) {
  if (this.product_Shelf_Life) {
    this.expiry_Date = new Date(
      this.product_Date.getTime() +
        this.product_Shelf_Life * 24 * 60 * 60 * 1000
    );
  }
  next();
});

// Pre-save hook to generate custom product ID
ArchiveDetailsSchema.pre("save", async function (next) {
  const product = this;

  if (!product.product_Id) {
    try {
      const counter = await CounterModel.findOneAndUpdate(
        { id: "productId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

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

// Create and export the model
const ArchiveDetailsModel =
  mongoose.models.ArchiveDetails ||
  mongoose.model("ArchiveDetails", ArchiveDetailsSchema);

export default ArchiveDetailsModel;
