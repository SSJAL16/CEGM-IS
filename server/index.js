import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import supplierRoutes from "./routes/supplier.route.js";
import purchaseOrderRoutes from "./routes/purchaseOrder.route.js";
import grnRoutes from "./routes/grn.route.js";
import rmaRoutes from "./routes/rma.route.js";
import backorderRoutes from "./routes/backorder.route.js";
import productRoutes from "./routes/product.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import salesRoutes from "./routes/salesRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// STORAGE
import storageProductRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import storageSupplierRoutes from "./routes/storageSupplier.route.js";
import manualAdjustmentRoutes from "./routes/manualAdjustmentRoutes.js";
import stockMovement from "./routes/stockMovement.js";
import archiveProductRoutes from "./routes/productArchive.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
const avatarsDir = path.join(uploadDir, "avatars");
const rmaProofsDir = path.join(uploadDir, "rma_proofs");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}
if (!fs.existsSync(rmaProofsDir)) {
  fs.mkdirSync(rmaProofsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/grns", grnRoutes);
app.use("/api/rmas", rmaRoutes);
app.use("/api/backorders", backorderRoutes);

//Storage
app.use("/api/storage-products", storageProductRoutes); // Prefix for product routes
app.use("/api/category", categoryRoutes); // Prefix for category routes
app.use("/api/archive", archiveProductRoutes);

app.use("/api/storageSupplier", storageSupplierRoutes);
app.use("/api/manualAdjustment", manualAdjustmentRoutes); // Prefix for manual adjustment routes
app.use("/api/stockMovement", stockMovement); // Prefix for stock movement routes

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(salesRoutes);

// Initialize server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start the server after successful database connection
    app.listen(PORT, () => {
      console.log("Server started at http://localhost:" + PORT);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
