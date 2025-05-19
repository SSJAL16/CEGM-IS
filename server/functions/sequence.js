import mongoose from "mongoose";
/*-----------------------------General Functions!----------------------------*/

// Sequence Schema for generating IDs
const sequenceSchema = new mongoose.Schema({
  sequenceName: { type: String, unique: true },
  sequenceValue: { type: Number, default: 1 }
});

const Sequence = mongoose.model('Sequence', sequenceSchema);

export async function getNextSequence(sequenceName) {
  const sequence = await Sequence.findOneAndUpdate(
    { sequenceName: sequenceName },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  return sequence.sequenceValue;
}
