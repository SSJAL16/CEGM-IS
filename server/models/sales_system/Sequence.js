import mongoose from "mongoose";

const sequenceSchema = new mongoose.Schema({
    sequenceName: { type: String, unique: true },
    sequenceValue: { type: Number, default: 1 }
});

const Sequence = mongoose.model('Sequence', sequenceSchema);
module.exports = Sequence;

export default Sequence;