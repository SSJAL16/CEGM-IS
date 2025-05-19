import mongoose from "mongoose";
// Define the schema for the counter
const CounterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

// Use the existing model if it has already been compiled, otherwise compile a new model
const CounterModel =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

export default CounterModel;
