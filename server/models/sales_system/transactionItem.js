import mongoose from "mongoose";

const transactionItemSchema = new mongoose.Schema({
  transaction_Item_id: String,
  product_id: String,
  sales_Transaction_ID: String,
  quantity_integer: Number,
  unit_price: Number,
  totalPrice: Number,
  product_name: String,
  product_category: String,
  product_description: String,
  product_supplier: String,
  status: {
    type: String,
    enum: ["Completed", "Refunded", "Replaced"],
    default: "Completed",
  },
});

const salesSystemTransactionItemModel = mongoose.model(
  "transactionItem",
  transactionItemSchema
);


export default salesSystemTransactionItemModel;