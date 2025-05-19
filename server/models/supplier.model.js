import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
      person_name: {
        type: String,
        required: true,
      },
      person_number: {
        type: String,
        required: true,
      },
      person_email: {
        type: String,
        required: false,
      },
      company_name: {
        type: String,
        required: true,
      },
      company_email: {
        type: String,
        required: true,
      },
      company_country: {
        type: String,
        required: true,
      },
      company_province: {
        type: String,
        required: true,
      },
      company_city: {
        type: String,
        required: true,
      },
      company_zipCode: {
        type: String,
        required: true,
      },
},
{
    timestamps: true, 
}
);

export default mongoose.model("Supplier", supplierSchema);