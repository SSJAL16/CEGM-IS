import mongoose from "mongoose";


const replacedItemSchema = new mongoose.Schema({
    replace_id: {
        type: String,
        ref: "Refund",
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
    replaced_quantity: {
        type: Number,
        required: true,
    }
});

const salesSystemReplacedItemsModel = mongoose.model("RefundedItems", replacedItemSchema);

export default salesSystemReplacedItemsModel;