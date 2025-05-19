import express from "express";
import {
    createGRN,
    getAllGRNs,
    getAllArchivedGRNs,
    updateGRN,
    archiveGRN,
    deleteGRN,
    getGRNReports,
    addProductQuantity,
    retrieveGRN
} from "../controllers/grn.controller.js";

const router = express.Router();

router.get("/report", getGRNReports);
router.get("/archived", getAllArchivedGRNs);
router.post("/", createGRN);
router.get("/", getAllGRNs);
router.put("/:id", updateGRN);
router.put("/archive/:id", archiveGRN);
router.put("/retrieve/:id", retrieveGRN);
router.delete("/:id", deleteGRN);
router.patch("/add-quantity", addProductQuantity);

export default router;
