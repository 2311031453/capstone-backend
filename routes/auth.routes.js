import express from "express";
import { registerMinePlanner, registerShippingPlanner, login } from "../controllers/auth.controller.js";

const router = express.Router();

// register mine planner
router.post("/register/mine", registerMinePlanner);

// register shipping planner
router.post("/register/shipping", registerShippingPlanner);

// login (role in body: mine_planner OR shipping_planner)
router.post("/login", login);

export default router;
