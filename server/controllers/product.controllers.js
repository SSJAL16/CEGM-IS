import Product from "../models/product.model.js";
import mongoose from "mongoose";

export const createProduct = async (req, res) => {
  const {supplier_id, product_Name, product_Description, product_Category, product_Price, product_Current_Stock, product_Minimum_Stock_Level, product_Maximum_Stock_Level} = req.body;

  if ( !supplier_id || !product_Name || !product_Description || !product_Category || product_Price === undefined || product_Current_Stock === undefined || product_Minimum_Stock_Level === undefined || product_Maximum_Stock_Level === undefined) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields.",
    });
  }

  const newProduct = new Product({
    supplier_id,
    product_Name,
    product_Description,
    product_Category,
    product_Price,
    product_Current_Stock,
    product_Minimum_Stock_Level,
    product_Maximum_Stock_Level,
  });

  try {
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error in createProduct:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

