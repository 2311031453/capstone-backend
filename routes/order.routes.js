//order.routes.js
import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { allowRole } from "../middlewares/role.middleware.js";
import { 
  createOrder, 
  listOrdersMinePlanner, 
  getOrderById,
  listOrdersForShipping,
  deleteOrder
} from "../controllers/order.controller.js";

const router = express.Router();

// Mine Planner membuat order
router.post("/", authenticateToken, allowRole(["mine_planner"]), createOrder);

// Mine Planner melihat order miliknya
router.get("/mine", authenticateToken, allowRole(["mine_planner"]), listOrdersMinePlanner);

// Shipping Planner melihat semua order
router.get("/", authenticateToken, allowRole(["shipping_planner"]), listOrdersForShipping);

// Detail order
router.get("/:orderId", authenticateToken, getOrderById);

// Delete order (mine planner only, status must be Created)
router.delete("/:orderId", authenticateToken, allowRole(["mine_planner"]), deleteOrder);

export default router;