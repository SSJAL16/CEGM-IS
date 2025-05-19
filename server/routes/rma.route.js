import express from "express";
import {
    createRMA,
    getAllRMAs,
    getAllArchivedRMAs,
    updateRMA,
    archiveRMA,
    deleteRMA,
    getRMAReports,
    retrieveRMA
} from "../controllers/rma.controller.js";

const router = express.Router();
router.get("/report", getRMAReports);
router.get("/archived", getAllArchivedRMAs);
router.post("/", createRMA);
router.get("/", getAllRMAs);
router.put("/:id", updateRMA);
router.put("/archive/:id", archiveRMA);
router.put("/retrieve/:id", retrieveRMA);
router.delete("/:id", deleteRMA);

export default router;
