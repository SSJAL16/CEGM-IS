import mongoose from "mongoose";
const purchaseOrder = new mongoose.Schema(
    {
        user: {
          first_name: { type: String },
          last_name: { type: String },
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
        order_date: { type: Date, default: Date.now }, 
        order_status: { type: String, enum: ["Draft", "Approved", "Complete", "Archived"], required: true },
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
            quantity: { type: Number},
            backorder_quantity: { type: Number},  
            status: {type: String, enum: ["Pending", "Complete"]}, 
          },
        ],
      },
      
    {
        timestamps: true,
    }
);

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrder);

export default PurchaseOrder;
