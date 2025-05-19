import express from "express";
import {
    getBackorderedProducts,
    createBackOrder,
    getAllBackOrders,
    updateBackOrder,
    getAllArchivedBackOrders,
    archiveBackOrder,
    deleteBackOrder,
    getBackOrderReports,
    retrieveBackOrder
} from "../controllers/backorder.controller.js";

const router = express.Router();

router.get("/products", getBackorderedProducts)
router.get("/archived", getAllArchivedBackOrders);
router.get("/report", getBackOrderReports);
router.post("/", createBackOrder);
router.get("/", getAllBackOrders);
router.put("/:id", updateBackOrder);
router.put("/archive/:id", archiveBackOrder);
router.put("/retrieve/:id", retrieveBackOrder);
router.delete("/:id", deleteBackOrder);

export default router;
