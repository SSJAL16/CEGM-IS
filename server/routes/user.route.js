import express from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getUserById,
  approveUser,
  rejectUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:user_id/approve", approveUser);
router.patch("/:user_id/reject", rejectUser);

export default router;
