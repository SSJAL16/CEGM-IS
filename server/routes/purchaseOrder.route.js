import express from "express";
import {
  getLowStockGroupedBySupplier,
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  getAllArchivedPurchaseOrders,
  updatePurchaseOrder,
  archivePurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrderReports,
  retrievePurchaseOrder
} from "../controllers/purchaseOrder.controller.js";

const router = express.Router();

router.get("/low-stock", getLowStockGroupedBySupplier);
router.get("/report", getPurchaseOrderReports);
router.get("/archived", getAllArchivedPurchaseOrders);
router.post("/", createPurchaseOrder);
router.get("/", getAllPurchaseOrders);
router.put("/archive/:id", archivePurchaseOrder);
router.put("/retrieve/:id", retrievePurchaseOrder);
router.get("/:id", getPurchaseOrderById);
router.put("/:id", updatePurchaseOrder);
router.delete("/:id", deletePurchaseOrder);

export default router;
