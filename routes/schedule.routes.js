import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { allowRole } from "../middlewares/role.middleware.js";
import { createSchedule, updateScheduleStatus, listSchedules } from "../controllers/schedule.controller.js";

const router = express.Router();

// Shipping planner membuat schedule untuk sebuah order
router.post("/", authenticateToken, allowRole(["shipping_planner"]), createSchedule);

// Update status schedule (shipping planner)
router.put("/:scheduleId", authenticateToken, allowRole(["shipping_planner"]), updateScheduleStatus);

// list schedules
router.get("/", authenticateToken, listSchedules);

export default router;
