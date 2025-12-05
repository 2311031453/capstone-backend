// routes/schedule.routes.js - UPDATE
import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { allowRole } from "../middlewares/role.middleware.js";
import { 
  createSchedule, 
  updateScheduleStatus, 
  listSchedules,
  getScheduleDetail,
  getSchedulesByOrderId 
} from "../controllers/schedule.controller.js";

const router = express.Router();

// Shipping planner membuat schedule untuk sebuah order
router.post("/", authenticateToken, allowRole(["shipping_planner"]), createSchedule);

// Update status schedule (shipping planner)
router.put("/:scheduleId", authenticateToken, allowRole(["shipping_planner"]), updateScheduleStatus);

// list schedules (untuk kedua role)
router.get("/", authenticateToken, listSchedules);

// TAMBAHKAN: Detail schedule (untuk kedua role)
router.get("/:scheduleId", authenticateToken, getScheduleDetail);

// TAMBAHKAN: Schedules berdasarkan orderId (untuk kedua role)
router.get("/order/:orderId", authenticateToken, getSchedulesByOrderId);

export default router;