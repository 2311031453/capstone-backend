// controllers/auth.controller.js
import * as AuthService from "../services/auth.service.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { created, ok, error } from "../utils/response.util.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || "rtoken";
const NODE_ENV = process.env.NODE_ENV || "development";
const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "30", 10);

const setRefreshCookie = (res, tokenRaw) => {
  const maxAge = REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
  res.cookie(REFRESH_COOKIE_NAME, tokenRaw, {
    httpOnly: true,
    sameSite: "lax",
    maxAge,
    secure: NODE_ENV === "production",
    path: "/",
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: NODE_ENV === "production", path: "/" });
};

export const registerMinePlanner = asyncHandler(async (req, res) => {
  const { error: vErr } = registerSchema.validate(req.body);
  if (vErr) return res.status(400).json({ message: vErr.message });

  const payload = req.body;
  const result = await AuthService.register({ ...payload, type: "mine" });
  return created(res, { user: result.user, token: result.token }, "Registrasi berhasil (Mine Planner)");
});

export const registerShippingPlanner = asyncHandler(async (req, res) => {
  const { error: vErr } = registerSchema.validate(req.body);
  if (vErr) return res.status(400).json({ message: vErr.message });

  const payload = req.body;
  const result = await AuthService.register({ ...payload, type: "shipping" });
  return created(res, { user: result.user, token: result.token }, "Registrasi berhasil (Shipping Planner)");
});

export const login = asyncHandler(async (req, res) => {
  const { error: vErr } = loginSchema.validate(req.body);
  if (vErr) return res.status(400).json({ message: vErr.message });

  const { email, password, role } = req.body;
  const ip = req.ip || req.headers["x-forwarded-for"] || null;
  const userAgent = req.get("User-Agent") || null;

  const { accessToken, refreshTokenRaw, user } = await AuthService.login({ email, password, role, ip, userAgent });
  setRefreshCookie(res, refreshTokenRaw);

  return ok(res, { token: accessToken, user }, "Login berhasil");
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const { id, type } = req.user;
  const user = await AuthService.me({ id, type });
  return ok(res, { user }, "Profile fetched");
});

export const refreshToken = asyncHandler(async (req, res) => {
  const raw = req.cookies[REFRESH_COOKIE_NAME];
  if (!raw) return res.status(401).json({ message: "Refresh token tidak ditemukan" });

  const record = await AuthService.findRefreshTokenByRaw(raw);
  if (!record) {
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Refresh token tidak valid" });
  }

  if (new Date() > new Date(record.expiresAt) || record.revoked) {
    if (!record.revoked) {
      record.revoked = true;
      await record.save();
    }
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Refresh token expired / revoked" });
  }

  const { newRaw, newRec } = await AuthService.rotateRefreshToken(record, { ip: req.ip, userAgent: req.get("User-Agent") });
  setRefreshCookie(res, newRaw);

  // generate access token (email omitted — client calls /me)
  const accessToken = generateAccessToken({ id: record.userId, role: record.userType === "mine" ? "mine_planner" : "shipping_planner", email: null, type: record.userType });

  return ok(res, { token: accessToken }, "Token refreshed");
});

// logout
export const logout = asyncHandler(async (req, res) => {
  const raw = req.cookies[REFRESH_COOKIE_NAME];
  if (raw) {
    const record = await AuthService.findRefreshTokenByRaw(raw);
    if (record && !record.revoked) await AuthService.revokeRefreshToken(record);
  }
  clearRefreshCookie(res);
  return ok(res, {}, "Logout berhasil");
});

// sessions
export const listSessions = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const userId = req.user.id;
  const userType = req.user.type;
  const sessions = await AuthService.listSessionsForUser({ userId, userType });
  return ok(res, { sessions }, "Sessions fetched");
});

export const revokeSession = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const { sessionId } = req.params;
  const userId = req.user.id;
  const userType = req.user.type;
  const session = await db.RefreshToken.findByPk(sessionId);
  if (!session) return res.status(404).json({ message: "Session tidak ditemukan" });
  if (session.userId !== userId || session.userType !== userType) return res.status(403).json({ message: "Tidak berwenang" });

  session.revoked = true;
  await session.save();

  // if cookie belongs to this session, clear
  const currentCookie = req.cookies[REFRESH_COOKIE_NAME];
  if (currentCookie) {
    const hash = require("crypto").createHash("sha256").update(currentCookie).digest("hex");
    if (hash === session.tokenHash) res.clearCookie(REFRESH_COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: NODE_ENV === "production", path: "/" });
  }

  return ok(res, {}, "Session berhasil dicabut (revoked)");
});
