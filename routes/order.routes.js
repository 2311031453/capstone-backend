import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { allowRole } from "../middlewares/role.middleware.js";
import { createOrder, listOrdersMinePlanner, getOrderById } from "../controllers/order.controller.js";

const router = express.Router();

// Mine Planner membuat order
router.post("/", authenticateToken, allowRole(["mine_planner"]), createOrder);

// Mine Planner melihat order miliknya
router.get("/mine", authenticateToken, allowRole(["mine_planner"]), listOrdersMinePlanner);

// detail order
router.get("/:orderId", authenticateToken, getOrderById);

export default router;
