import mongoose from "mongoose";

const replaceSchema = new mongoose.Schema({
    transaction_Id: {   
        type: String,
        ref: "SalesTransaction",
        required: true,
    },
    replaceReason: {
        type: String,
        default: "No reason provided",
    },
    replaceDate: {
        type: Date,
        default: Date.now,
    },
});

const salesSystemReplaceModel = mongoose.model("Replace", replaceSchema);

export default salesSystemReplaceModel;