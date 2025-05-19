import express from 'express';
const { productDetailsModel } = require("../models/productDetails");


const router = express.Router();

//FETCH PRODUCT BY ID
const getProductsByID = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await productDetailsModel.find({ product_Id: id })
      .select('product_Id product_Name product_Category product_Current_Stock product_Price')
      .sort({ product_Name: 1 });
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products by ID:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

//FETCH PRODUCTS
const getProducts = async (req, res) => {
  try {
    const products = await productDetailsModel.find({})
      .select('product_Id product_Name product_Category product_Current_Stock product_Price')
      .sort({ product_Name: 1 });
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

//FETCH PRODUCTS BY CATEGORY
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await productDetailsModel.find({ product_Category: category })
      .select('product_Id product_Name product_Category product_Current_Stock product_Price')
      .sort({ product_Name: 1 });
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products for category:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

//FETCH CATEGORY
const getAllCategories = async (req, res) => {
  try {
    const categories = await productDetailsModel.distinct('product_Category');
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

router.get('/productsByID/:id', getProductsByID);
router.get('/products', getProducts);
router.get('/productsByCategory/:category', getProductsByCategory);
router.get('/categories', getAllCategories);

export default router;

