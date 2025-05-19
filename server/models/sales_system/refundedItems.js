import mongoose from "mongoose";

const refundedItemSchema = new mongoose.Schema({
    refund_id: {
        type: String,
        ref: "Replace",
        required: true,
    },
    transaction_Item_id: {
        type: String,
        ref: "TransactionItem",
        required: true,
    },
    product_id: {
        type: String,
        ref: "Product",
        required: true,
    },
    product_category: {
        type: String,
        required: true,
    },
    product_name: {
        type: String,
        required: true,
    },
    product_description: {
        type: String,
        required: true,
    },
    product_supplier: {
        type: String,
        required: true,
    },
    refunded_quantity: {
        type: Number,
        required: true,
    },
    refunded_amount: {
        type: Number,
        required: true,
    },
});

const salesSystemRefundedItemsModel = mongoose.model("ReplacedItems", refundedItemSchema);


export default salesSystemRefundedItemsModel;