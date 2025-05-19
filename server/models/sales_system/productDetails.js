import mongoose from "mongoose";

const ProductDetailsSchema = new mongoose.Schema(
    {
        product_Id: { type: String, unique: true },
        product_Name: { type: String, required: true },
        product_Category: { type: String, required: true },
        product_Supplier: { type: String, required: true },
        product_Description: { type: String, required: true },
        product_Current_Stock: { type: Number, required: true },
        product_Quantity: { type: Number },
        product_Price: { type: Number, required: true },
        product_Minimum_Stock_Level: { type: Number, required: true },
        product_Maximum_Stock_Level: { type: Number, required: true },
        product_Date: { type: Date, default: Date.now },
        product_Status: { type: String },
    },
    {
        collection: "productDetails",
    }
);
const productDetailsModel = mongoose.models.ProductDetails || mongoose.model("ProductDetails", ProductDetailsSchema);

const getAllCategories = async () => {
    try {
        const categories = await productDetailsModel.distinct('product_Category');
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

const getProducts = async () => {
    try {
        const products = await productDetailsModel.find({})
            .select('product_Id product_Name product_Category product_Supplier product_Description product_Current_Stock product_Price')
            .sort({ product_Name: 1 });
        return products;
    } catch (error) {
        console.error('Error fetching products for category:', error);
        throw error;
    }
};

const getProductsByID = async (id) => {
    try {
        const products = await productDetailsModel.find({ product_Id: id })
            .select('product_Id product_Name product_Category product_Supplier product_Description product_Current_Stock product_Price')
            .sort({ product_Name: 1 });
        return products;
    } catch (error) {
        console.error('Error fetching products for category:', error);
        throw error;
    }
};

const getProductsByCategory = async (category) => {
    try {
        const products = await productDetailsModel.find({ product_Category: category })
            .select('product_Id product_Name product_Category product_Supplier product_Description product_Current_Stock product_Price')
            .sort({ product_Name: 1 });
        return products;
    } catch (error) {
        console.error('Error fetching products for category:', error);
        throw error;
    }
};


export default { productDetailsModel, getAllCategories, getProductsByCategory, getProducts, getProductsByID };