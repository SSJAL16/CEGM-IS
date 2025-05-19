import mongoose from "mongoose";

const salesTransactionSchema = new mongoose.Schema({
  sales_Transaction_id: String,
  user_id: Number,
  cashier_name: String,
  transaction_Date: Date,
  orNumber: Number,
  total_Sales: Number,
  amount_Given: Number,
  profit: Number,
});

const salesSystemSalesTransactionModel = mongoose.model("salesTransaction", salesTransactionSchema);

export default salesSystemSalesTransactionModel;


