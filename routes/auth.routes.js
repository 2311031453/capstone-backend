// routes/auth.routes.js
import express from "express";
import {
  registerMinePlanner,
  registerShippingPlanner,
  login,
  me,
  refreshToken,
  logout,
  listSessions,
  revokeSession,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// register mine planner
router.post("/register/mine", registerMinePlanner);

// register shipping planner
router.post("/register/shipping", registerShippingPlanner);

// login (role in body: mine_planner OR shipping_planner)
router.post("/login", login);

// me (protected)
router.get("/me", authenticateToken, me);

// refresh token (uses cookie)
router.post("/refresh-token", refreshToken);

// logout (will revoke cookie token)
router.post("/logout", logout);

// sessions management (list & revoke)
router.get("/sessions", authenticateToken, listSessions); // list current user's sessions
router.delete("/sessions/:sessionId", authenticateToken, revokeSession); // revoke specific session

export default router;
