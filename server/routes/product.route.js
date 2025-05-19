import express from "express";
import {
  createProduct,
} from "../controllers/product.controllers.js";

const router = express.Router();

router.post("/", createProduct);


export default router;
