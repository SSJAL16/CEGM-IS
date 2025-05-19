import mongoose from "mongoose";
const grn = new mongoose.Schema(
    {
        user: {
          first_name: { type: String},
          last_name: { type: String},
        }, 
        supplier: { 
          person_name: { type: String, required: true},
          person_number: { type: String,required: true},
          person_email: { type: String, required: false},
          company_name: { type: String, required: true},
          company_email: { type: String, required: false},
          company_country: { type: String, required: true},
          company_province: { type: String, required: true},
          company_city: { type: String, required: true},
          company_zipCode: { type: String, required: true},
        },
        po: {
          po_id:  { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder"},
          order_date: { type: Date }
        }, 
        delivered_date: { type: Date, default: null },
        mop: { type: String, required: true },
        order_status: { type: String, enum: ["Draft", "Approved", "Archived"], required: true }, 
        archivedAt: { type: Date, default: null},
        items: [
            {
                product_Id: { type: String},
                product_Name: { type: String},
                product_Description: { type: String}, 
                product_Category: { type: String}, 
                product_Current_Stock: { type: Number}, 
                product_Maximum_Stock_Level: { type: Number},
                product_Minimum_Stock_Level: { type: Number},
                product_Price: { type: Number}, 
                order_quantity: { type: Number},
                received_quantity: { type: Number},
                return_quantity: { type: Number},
            },
    ],
  },
  
  {
    timestamps: true,
  }
);

const GRN = mongoose.model("GRN", grn);

export default GRN;
