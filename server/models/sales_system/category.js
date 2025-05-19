import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  category_id: Number,
  product_Category: String

  /*name: String,
  email: String,
  password: String*/
});

const salesSystemCategoryModel = mongoose.model("category", categorySchema);

export default salesSystemCategoryModel;