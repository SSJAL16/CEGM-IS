import mongoose from "mongoose";

const refundSchema = new mongoose.Schema({
    transaction_Id: {   
        type: String,
        ref: "SalesTransaction",
        required: true,
    },
    refundReason: {
        type: String,
        default: "No reason provided",
    },
    totalRefundAmount: {
        type: Number,
        required: true,
    },
    refundDate: {
        type: Date,
        default: Date.now,
    },
});

const salesSystemRefundModel = mongoose.model("Refund", refundSchema);

export default salesSystemRefundModel;