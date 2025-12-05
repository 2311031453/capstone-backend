// routes/auth.routes.js
import express from "express";
import * as AuthController from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register/mine", AuthController.registerMinePlanner);
router.post("/register/shipping", AuthController.registerShippingPlanner);
router.post("/login", AuthController.login);
router.get("/me", authenticateToken, AuthController.me);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);
router.get("/sessions", authenticateToken, AuthController.listSessions);
router.delete("/sessions/:sessionId", authenticateToken, AuthController.revokeSession);

export default router;
